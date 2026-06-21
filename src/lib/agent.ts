import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { SystemMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import { MOCK_PRODUCTS } from './mock-data';

const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'elisee.shop';
const SHOP_TOKEN  = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN  || 'fd3d51862812c1f0c530dc83ac3f6685';

// ─── LLM ──────────────────────────────────────────────────────────────────────
let llm: ChatGoogleGenerativeAI | null = null;
if (process.env.GOOGLE_API_KEY) {
  llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

// ─── Tools ────────────────────────────────────────────────────────────────────
const searchCatalogTool = tool(
  async ({ query }: { query: string }) => {
    const graphql = `
      query searchProducts($query: String!) {
        products(first: 5, query: $query) {
          edges {
            node {
              id
              title
              description
              priceRange { minVariantPrice { amount currencyCode } }
              availableForSale
            }
          }
        }
      }
    `;
    try {
      const res  = await fetch(`https://${SHOP_DOMAIN}/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOP_TOKEN,
        },
        body: JSON.stringify({ query: graphql, variables: { query } }),
      });
      const data = await res.json();
      if (data.errors) return JSON.stringify({ error: data.errors });

      const products = data.data.products.edges.map((e: { node: { id: string; title: string; priceRange: { minVariantPrice: { amount: string; currencyCode: string } }; availableForSale: boolean } }) => ({
        id:        e.node.id,
        title:     e.node.title,
        price:     `${e.node.priceRange.minVariantPrice.amount} ${e.node.priceRange.minVariantPrice.currencyCode}`,
        available: e.node.availableForSale,
      }));

      if (products.length > 0) return JSON.stringify(products);

      // Fallback ai dati mock se il catalogo è vuoto
      return JSON.stringify(
        MOCK_PRODUCTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      );
    } catch {
      return JSON.stringify(
        MOCK_PRODUCTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      );
    }
  },
  {
    name: 'search_catalog',
    description: "Cerca prodotti nel catalogo Shopify (es. 't-shirt nera' o 'scarpe running'). Restituisce una lista di prodotti con ID, titolo e prezzo.",
    schema: z.object({
      query: z.string().describe("Il termine di ricerca (es. 'scarpe', 'nero')"),
    }),
  }
);

const generateQuoteTool = tool(
  async ({ service, budget }: { service: string; budget?: string }) => {
    return JSON.stringify({
      status:         'Preventivo Generato',
      service,
      estimated_cost: budget || '1.200€',
      timeline:       '2 settimane',
      message:        'Il preventivo è stato registrato nel sistema. Il cliente può approvarlo direttamente.',
    });
  },
  {
    name: 'generate_quote',
    description: 'Genera un preventivo per un servizio creativo (video, branding, spot).',
    schema: z.object({
      service: z.string().describe("Il tipo di servizio (es. 'Spot Cinematico', 'Reel TikTok')"),
      budget:  z.string().optional().describe('Il budget stimato, se applicabile'),
    }),
  }
);

const recommendOutfitTool = tool(
  async ({ occasion, style_preference }: { occasion: string; style_preference?: string }) => {
    const tops  = MOCK_PRODUCTS.filter(p =>
      p.title.toLowerCase().includes('t-shirt') ||
      p.title.toLowerCase().includes('felpa') ||
      p.title.toLowerCase().includes('giacca')
    );
    const shoes = MOCK_PRODUCTS.filter(p =>
      p.title.toLowerCase().includes('sneakers') || p.title.toLowerCase().includes('scarpe')
    );

    const top  = tops[Math.floor(Math.random() * tops.length)]   || { title: 'T-Shirt Elisee Basic',  priceRange: { minVariantPrice: { amount: '35', currencyCode: 'EUR' } } };
    const shoe = shoes[Math.floor(Math.random() * shoes.length)] || { title: 'Sneakers Elisee',        priceRange: { minVariantPrice: { amount: '95', currencyCode: 'EUR' } } };

    return JSON.stringify({
      message: `Ho preparato un outfit perfetto per l'occasione '${occasion}'${style_preference ? ` con stile '${style_preference}'` : ''}.`,
      outfit:  [top, shoe],
      total_estimated_price: '130 EUR',
    });
  },
  {
    name: 'recommend_outfit',
    description: "Crea un outfit completo (maglia + scarpe) basato sull'occasione o sullo stile preferito.",
    schema: z.object({
      occasion:         z.string().describe("L'occasione (es. 'serata', 'palestra', 'ufficio')"),
      style_preference: z.string().optional().describe("Le preferenze di stile (es. 'elegante', 'sportivo')"),
    }),
  }
);

const tools       = [searchCatalogTool, generateQuoteTool, recommendOutfitTool];

// Cast esplicito per risolvere l'errore TS2349 sull'union type non callable
interface InvokableTool {
  invoke(input: Record<string, unknown>): Promise<string>;
}
const toolsByName = Object.fromEntries(
  tools.map(t => [t.name, t as unknown as InvokableTool])
);
const llmWithTools = llm ? llm.bindTools(tools) : null;

// ─── Graph State ─────────────────────────────────────────────────────────────
interface AgentState {
  messages: BaseMessage[];
  profile:  Record<string, string> | null;
}

const GraphState = {
  messages: {
    value:   (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: (): BaseMessage[] => [],
  },
  profile: {
    value:   (_x: Record<string, string> | null, y: Record<string, string> | null) => y,
    default: (): null => null,
  },
};

// ─── Nodes ───────────────────────────────────────────────────────────────────
async function agentNode(state: AgentState) {
  const profile        = state.profile || {};
  const profileContext = profile.name
    ? `Il cliente si chiama ${profile.name}. ${profile.email ? 'Email: ' + profile.email : ''}`
    : "L'utente è anonimo.";

  const systemMessage = new SystemMessage(`
    Sei l'Agente Elisee, un Personal Stylist e Creative Director per l'app e-commerce "Elisee".
    
    Aiuta i clienti a:
    1. Trovare abbigliamento esclusivo e di alta qualità nello shop.
    2. Creare pacchetti e preventivi per progetti visivi/creativi (spot, reel, branding).
    
    ${profileContext}
    
    REGOLE:
    - Usa un tono premium ed esclusivo.
    - Se l'utente cerca un prodotto, USA il tool 'search_catalog'. Non inventare prodotti.
    - Se l'utente chiede un preventivo, USA il tool 'generate_quote'.
    - Formatta l'output SOLO con tag HTML validi (<br>, <b>, <i>, <ul>, <li>) perché verrà renderizzato con innerHTML.
    - Non usare markdown.
  `);

  if (!llmWithTools) {
    throw new Error('LLM non disponibile: aggiungi GOOGLE_API_KEY al file .env.local');
  }

  const response = await llmWithTools.invoke([systemMessage, ...state.messages]);
  return { messages: [response] };
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

async function toolNode(state: AgentState) {
  const results: ToolMessage[] = [];
  const lastMessage = state.messages[state.messages.length - 1] as BaseMessage & { tool_calls?: ToolCall[] };

  if (lastMessage?.tool_calls?.length) {
    for (const toolCall of lastMessage.tool_calls) {
      const t = toolsByName[toolCall.name];
      if (t) {
        const observation = await t.invoke(toolCall.args);
        results.push(
          new ToolMessage({
            content:      observation,
            tool_call_id: toolCall.id,
            name:         toolCall.name,
          })
        );
      }
    }
  }
  return { messages: results };
}

function shouldContinue(state: AgentState): string {
  const lastMessage = state.messages[state.messages.length - 1] as BaseMessage & { tool_calls?: ToolCall[] };
  return lastMessage?.tool_calls?.length ? 'tools' : END;
}

// ─── Compile Graph ────────────────────────────────────────────────────────────
const workflow = new StateGraph<AgentState>({ channels: GraphState })
  .addNode('agent', agentNode)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

const memory = new MemorySaver();

// ─── Smart fallback without API key ──────────────────────────────────────────
function smartFallback(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('outfit') || msg.includes('vestire') || msg.includes('indossare') || msg.includes('abbinare')) {
    const occasion = msg.includes('sera') || msg.includes('sera') ? 'serata' : msg.includes('palestra') || msg.includes('workout') || msg.includes('sport') ? 'palestra' : msg.includes('ufficio') || msg.includes('lavoro') ? 'ufficio' : 'casual';
    const outfits: Record<string, string> = {
      serata: '<b>Outfit da Sera Elisee:</b><br><ul><li>Camicia oversize nera con dettagli oro</li><li>Pantaloni slim fit antracite</li><li>Sneakers chunky bianche</li><li>Accessori dorati</li></ul>Stile: <i>Dark Luxury</i> 🖤✨',
      palestra: '<b>Outfit Workout Elisee:</b><br><ul><li>T-shirt tecnica traspirante</li><li>Shorts o leggings performance</li><li>Sneakers running con supporto</li></ul>Stile: <i>Sport Premium</i> 💪',
      ufficio: '<b>Outfit Business Elisee:</b><br><ul><li>Polo o camicia elegante</li><li>Chino slim fit grigio/navy</li><li>Sneakers clean in pelle bianca</li></ul>Stile: <i>Smart Casual</i> 👔',
      casual: '<b>Outfit Casual Elisee:</b><br><ul><li>T-shirt grafica limited edition</li><li>Jeans straight fit</li><li>Sneakers lifestyle colorate</li></ul>Stile: <i>Urban Street</i> 🔥',
    };
    return outfits[occasion] || outfits.casual;
  }

  if (msg.includes('scarpe') || msg.includes('sneakers') || msg.includes('calzature')) {
    return '<b>Sneakers Elisee — Top Picks:</b><br><ul><li>🥇 Elisee Runner Pro — Running performance, €89</li><li>🥈 Elisee Street Classic — Urban lifestyle, €75</li><li>🥉 Elisee Court Low — Basket clean, €65</li></ul>Vuoi filtrare per colore o taglia? Scrivimi!';
  }

  if (msg.includes('preventivo') || msg.includes('video') || msg.includes('spot') || msg.includes('reel') || msg.includes('brand') || msg.includes('grafica') || msg.includes('logo')) {
    return '<b>Preventivi Elisee Graphics:</b><br><ul><li>📸 Servizio Foto — da <b>350€</b></li><li>🎬 Spot Pubblicitario — da <b>800€</b></li><li>📱 Reel/TikTok — da <b>400€</b></li><li>🎨 Brand Identity — da <b>1.200€</b></li></ul>Scrivi il tuo progetto e ti contatterò entro 24h!';
  }

  if (msg.includes('ciao') || msg.includes('salve') || msg.includes('buon')) {
    return 'Ciao! Sono l\'Agente <b>Elisee</b>. 👋<br><br>Posso aiutarti a:<br><ul><li>👗 Creare outfit personalizzati</li><li>👟 Trovare scarpe e accessori</li><li>🎬 Richiedere preventivi grafici</li></ul>Come posso aiutarti oggi?';
  }

  if (msg.includes('grazie') || msg.includes('perfetto') || msg.includes('ok')) {
    return 'Prego! 🙏 Sono sempre qui se hai bisogno. Per qualsiasi cosa — outfit, prodotti o preventivi — basta scrivermi!';
  }

  return `Ho capito la tua richiesta: <i>"${userMessage}"</i>.<br><br>Come Agente Elisee posso aiutarti con:<br><ul><li>👗 <b>Outfit personalizzati</b> — descrivimi l'occasione</li><li>👟 <b>Prodotti del catalogo</b> — cosa stai cercando?</li><li>🎬 <b>Preventivi creativi</b> — video, foto, brand identity</li></ul>Dimmi di più e creo qualcosa su misura per te! ✨`;
}

export const eliseeAgent = llm
  ? workflow.compile({ checkpointer: memory })
  : {
      invoke: async (input: { messages: Array<{ content: string }> }) => {
        const messages = input?.messages || [];
        const lastUserMsg = messages.length > 0 ? (messages[messages.length - 1]?.content || '') : '';
        const response = smartFallback(String(lastUserMsg));
        return { messages: [{ content: response }] };
      },
    };
