import { MOCK_PRODUCTS, MOCK_COLLECTIONS, MOCK_CUSTOMERS } from './mock-data.js';
import { cacheGet, cacheSet } from './cache.js';

export class ShopifyClient {
  constructor() {
    this.loadConfig();
  }


  // ── Credenziali reali di elisee.shop ──
  static DEFAULT_DOMAIN  = 'elisee.shop';
  static DEFAULT_TOKEN   = 'fd3d51862812c1f0c530dc83ac3f6685';
  static DEFAULT_VERSION = '2024-04';

  loadConfig() {
    // Usa le credenziali salvate manualmente, oppure quelle reali come default
    this.shopDomain  = localStorage.getItem('shopify_shop_domain')  || ShopifyClient.DEFAULT_DOMAIN;
    this.accessToken = localStorage.getItem('shopify_access_token') || ShopifyClient.DEFAULT_TOKEN;
    this.apiVersion  = localStorage.getItem('shopify_api_version')  || ShopifyClient.DEFAULT_VERSION;

    // useMock è false per default: ci connettiamo allo store reale
    const savedMock = localStorage.getItem('shopify_use_mock');
    this.useMock = savedMock === 'true'; // false se non impostato → store reale
  }


  saveConfig(domain, token, apiVersion = '2024-04', useMock = false) {
    // Rimuove http:// o https:// e gli slash finali
    let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    // Se non finisce con .myshopify.com, e non contiene già .myshopify.com, possiamo lasciarlo o formattarlo
    if (cleanDomain && !cleanDomain.includes('.')) {
      cleanDomain += '.myshopify.com';
    }

    localStorage.setItem('shopify_shop_domain', cleanDomain);
    localStorage.setItem('shopify_access_token', token);
    localStorage.setItem('shopify_api_version', apiVersion);
    localStorage.setItem('shopify_use_mock', useMock ? 'true' : 'false');
    
    this.loadConfig();
  }

  clearConfig() {
    localStorage.removeItem('shopify_shop_domain');
    localStorage.removeItem('shopify_access_token');
    localStorage.removeItem('shopify_api_version');
    localStorage.setItem('shopify_use_mock', 'false'); // Usa le API vere di default
    this.loadConfig();
  }

  get isConfigured() {
    // È configurato se ha un dominio e un token, e non è in modalità mock
    return !!(this.shopDomain && this.accessToken && !this.useMock);
  }


  async testConnection(domain, token, apiVersion = '2024-04') {
    let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    if (cleanDomain && !cleanDomain.includes('.')) {
      cleanDomain += '.myshopify.com';
    }

    const endpoint = `https://${cleanDomain}/api/${apiVersion}/graphql.json`;
    const query = `
      query {
        shop {
          name
          description
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const json = await response.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(json.errors[0].message);
      }

      return {
        success: true,
        shopName: json.data.shop.name,
        shopDescription: json.data.shop.description
      };
    } catch (error) {
      console.error("Shopify Connection Test Failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Determina se usare il proxy locale o chiamare Shopify direttamente.
   * Su localhost usa il proxy per evitare CORS.
   * Su un dominio pubblico chiama Shopify direttamente.
   */
  get useProxy() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  async queryStorefront(query, variables = {}) {
    if (!this.isConfigured) {
      throw new Error('Client Shopify non configurato.');
    }

    // ── CACHE LAYER (Layer 1) ──
    const isQuery = query.trim().toLowerCase().startsWith('query');
    let cacheKey = null;
    if (isQuery) {
      const rawKey = query + JSON.stringify(variables);
      // Hash semplice della query
      const hash = rawKey.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      cacheKey = 'sf_' + hash;
      const cached = cacheGet(cacheKey);
      if (cached) return cached;
    }

    // ── RETRY LOGIC CON EXPONENTIAL BACKOFF (Layer 2) ──
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        let json;
        if (this.useProxy) {
          const response = await fetch('/api/shopify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopDomain:  this.shopDomain,
              accessToken: this.accessToken,
              apiVersion:  this.apiVersion,
              query,
              variables,
            }),
          });
          if (!response.ok) throw new Error(`Errore proxy HTTP: ${response.status}`);
          json = await response.json();
        } else {
          const endpoint = `https://${this.shopDomain}/api/${this.apiVersion}/graphql.json`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': this.accessToken,
            },
            body: JSON.stringify({ query, variables }),
          });
          if (response.status === 429) {
            throw new Error(`Shopify Rate Limit Superato (429)`);
          }
          if (!response.ok) throw new Error(`Errore HTTP Shopify: ${response.status}`);
          json = await response.json();
        }

        if (json.errors) {
          throw new Error(json.errors.map(e => e.message).join(', '));
        }

        // Salva in cache solo le 'query' (non le 'mutation')
        if (isQuery && cacheKey) {
          cacheSet(cacheKey, json.data, 5 * 60 * 1000); // 5 minuti
        }

        return json.data;

      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`[Shopify API] Fallito definitivamente dopo ${maxRetries} tentativi:`, err.message);
          throw err;
        }
        console.warn(`[Shopify API] Tentativo ${attempt} fallito. Ritento tra poco... (${err.message})`);
        // Exponential backoff: 500ms, 1000ms
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    }
  }


  async getProducts(limit = 250, afterCursor = null) {
    if (this.useMock || !this.isConfigured) {
      return { products: MOCK_PRODUCTS, pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              vendor
              availableForSale
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              options {
                name
                values
              }
              collections(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const variables = { first: limit };
      if (afterCursor) variables.after = afterCursor;
      const data = await this.queryStorefront(query, variables);
      let products = data.products.edges.map(edge => edge.node);
      
      // Fallback: se il negozio reale è vuoto, usa i dati finti per non rompere l'UI
      if (products.length === 0) {
        console.warn("Il negozio Shopify non ha restituito prodotti. Verifica il dominio e il token.");
        alert("Shopify non ha restituito errori, ma l'elenco dei prodotti è VUOTO (0 prodotti). Assicurati di aver spuntato il canale 'Headless' su ogni prodotto.");
        products = MOCK_PRODUCTS;
      }
      return { products, pageInfo: data.products.pageInfo };
    } catch (error) {
      console.error("Chiamata API Shopify fallita in getProducts:", error);
      alert("ERRORE SHOPIFY API: " + error.message);
      return { products: MOCK_PRODUCTS, pageInfo: { hasNextPage: false, endCursor: null } };
    }
  }
  async getCollectionProducts(collectionId, limit = 250) {
    if (this.useMock || !this.isConfigured) {
      return { products: MOCK_PRODUCTS };
    }

    const query = `
      query getCollectionProducts($id: ID!, $first: Int!) {
        collection(id: $id) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                vendor
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                options {
                  name
                  values
                }
                collections(first: 5) {
                  edges {
                    node {
                      id
                      title
                    }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      availableForSale
                      selectedOptions { name value }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.queryStorefront(query, { id: collectionId, first: limit });
      if (!data.collection || data.collection.products.edges.length === 0) return { products: MOCK_PRODUCTS };
      return { products: data.collection.products.edges.map(e => e.node) };
    } catch (error) {
      console.error("Errore fetch getCollectionProducts:", error);
      return { products: MOCK_PRODUCTS };
    }
  }

  async getCollections() {
    if (this.useMock || !this.isConfigured) {
      return MOCK_COLLECTIONS;
    }

    const query = `
      query getCollections {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
            }
          }
        }
      }
    `;

    try {
      const data = await this.queryStorefront(query);
      let collections = data.collections.edges.map(edge => edge.node);
      if (collections.length === 0) {
        console.warn("Il negozio Shopify non ha restituito collezioni.");
        collections = MOCK_COLLECTIONS;
      }
      return collections;
    } catch (error) {
      console.error("Errore fetch getCollections:", error);
      return MOCK_COLLECTIONS;
    }
  }

  async searchProducts(searchQuery, limit = 50) {
    if (this.useMock || !this.isConfigured || !searchQuery) {
      return { products: MOCK_PRODUCTS };
    }

    const query = `
      query searchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              description
              vendor
              availableForSale
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              images(first: 5) {
                edges { node { url altText } }
              }
              options { name values }
              collections(first: 5) {
                edges { node { id title } }
              }
              variants(first: 20) {
                edges {
                  node {
                    id title availableForSale
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.queryStorefront(query, { query: searchQuery, first: limit });
      const products = data.products.edges.map(e => e.node);
      if (products.length === 0) return { products: MOCK_PRODUCTS };
      return { products };
    } catch (error) {
      console.error("Errore searchProducts:", error);
      return { products: MOCK_PRODUCTS };
    }
  }

  async createCheckoutUrl(cartItems) {
    if (this.useMock || !this.isConfigured) {
      // In modalità mock, simuliamo un reindirizzamento riuscito a un finto checkout
      return "https://checkout.shopify.com/mock-checkout-success";
    }

    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Preparazione delle righe del carrello per il formato GraphQL Shopify
    const lines = cartItems.map(item => ({
      merchandiseId: item.variantId,
      quantity: parseInt(item.qty || item.quantity || 1, 10)
    }));

    try {
      const data = await this.queryStorefront(mutation, { input: { lines } });
      const userErrors = data.cartCreate.userErrors;
      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      return data.cartCreate.cart.checkoutUrl;
    } catch (error) {
      console.error("Impossibile creare il checkout Shopify:", error);
      throw error;
    }
  }

  async customerCreate({ firstName, lastName, email, password }) {
    if (this.useMock || !this.isConfigured) {
      return { id: "mock-id", email, firstName, lastName };
    }
    const mutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
          }
          customerUserErrors {
            message
          }
        }
      }
    `;
    try {
      const data = await this.queryStorefront(mutation, { input: { firstName, lastName, email, password } });
      if (data.customerCreate.customerUserErrors.length > 0) {
        throw new Error(data.customerCreate.customerUserErrors[0].message);
      }
      return data.customerCreate.customer;
    } catch (error) {
      console.error("Errore customerCreate:", error);
      throw error;
    }
  }

  async customerLogin({ email, password }) {
    if (this.useMock || !this.isConfigured) {
      return { accessToken: "mock-token", expiresAt: "2099-01-01T00:00:00Z" };
    }
    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            message
          }
        }
      }
    `;
    try {
      const data = await this.queryStorefront(mutation, { input: { email, password } });
      if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
      }
      return data.customerAccessTokenCreate.customerAccessToken;
    } catch (error) {
      console.error("Errore customerLogin:", error);
      throw error;
    }
  }
}
