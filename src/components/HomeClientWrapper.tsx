'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import HomeProductsClient from './HomeProductsClient';

interface Collection {
  id: string;
  title: string;
  handle: string;
}

interface HomeClientWrapperProps {
  initialProducts: any[];
  initialCollections: Collection[];
}

export default function HomeClientWrapper({ initialProducts, initialCollections }: HomeClientWrapperProps) {
  const [profileName, setProfileName] = useState('Enea');
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('elisee:profile_name');
    if (savedName) {
      setProfileName(savedName.split(' ')[0]);
    }

    const fetchCollections = async () => {
      try {
        const query = `
          query getCollections {
            collections(first: 250) {
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
        const res = await fetch('/api/shopify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        const fetchedCollections = data.data?.collections?.edges?.map((edge: any) => edge.node) || [];
        if (fetchedCollections.length > 0) {
          const filtered = fetchedCollections
            .filter((col: any) => col.handle !== 'frontpage' && col.title !== 'Homepage')
            .sort((a: any, b: any) => a.title.localeCompare(b.title));
          setCollections(filtered);
        }
      } catch (err) {
        console.error("Errore nel caricamento delle collezioni dal client:", err);
      }
    };
    fetchCollections();
  }, []);

  const handleCollectionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const handle = e.target.value;
    setSelectedCollection(handle);
    setLoading(true);

    if (!handle) {
      // "Tutte le Collezioni" selected
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    try {
      const query = `
        query getCollectionProducts($handle: String!, $first: Int!) {
          collection(handle: $handle) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;
      const res = await fetch('/api/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { handle, first: 100 } })
      });
      const data = await res.json();
      const fetchedProducts = data.data?.collection?.products?.edges?.map((edge: any) => edge.node) || [];
      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Errore nel caricamento dei prodotti della collezione:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ padding: '24px 16px 8px', marginTop: '10px' }}>
        <h1 id="hero-title" style={{ fontFamily: 'var(--font-d)', fontSize: '32px', marginBottom: '16px', fontWeight: 600 }}>
          Buonasera, {profileName}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span style={{ fontSize: '20px' }}>⚽</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>Sport</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>il tuo stile Elisee</div>
          </div>
        </div>
      </div>

      <div className="home-section" style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-d)', fontSize: '22px' }}>Collezioni</h2>
        </div>
        <div style={{ position: 'relative' }}>
          <select 
            value={selectedCollection}
            onChange={handleCollectionChange}
            className="sort-select" 
            style={{ width: '100%', padding: '14px 16px', background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', appearance: 'none' }}
          >
            <option value="">Tutte le Collezioni</option>
            {collections.map(c => (
              <option key={c.id} value={c.handle}>{c.title}</option>
            ))}
          </select>
          <ChevronDown size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <span style={{ color: 'var(--gold)', fontSize: '14px' }}>Caricamento prodotti...</span>
        </div>
      ) : (
        <HomeProductsClient 
          products={products} 
          title={selectedCollection ? `Collezione: ${collections.find(c => c.handle === selectedCollection)?.title || 'Prodotti'}` : "Ultimi arrivi"}
        />
      )}

      <div style={{ height: '100px' }}></div>
    </>
  );
}
