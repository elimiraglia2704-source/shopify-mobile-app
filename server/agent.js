import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";

let llm = null;
if (process.env.GOOGLE_API_KEY) {
  llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY
  });
}

const searchCatalogTool = tool(
  async ({ query }) => {
    const shopDomain = 'eliseebrand.myshopify.com';
    const accessToken = 'fd3d51862812c1f0c530dc83ac3f6685';
    
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
      const response = await fetch(`https://${shopDomain}/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({ query: graphql, variables: { query } })
      });
      const data = await response.json();
      if (data.errors) return JSON.stringify({ error: data.errors });
      
      const products = data.data.products.edges.map(e => {
        const p = e.node;
        return {
          id: p.id,
          title: p.title,
          price: p.priceRange.minVariantPrice.amount + ' ' + p.priceRange.minVariantPrice.currencyCode,
          available: p.availableForSale
        };
      });
      return JSON.stringify(products.length ? products : { message: "Nessun prodotto trovato." });
    } catch (e) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "search_catalog",
    description: "Cerca prodotti nel catalogo di Shopify usando una query testuale (es. 't-shirt nera' o 'scarpe running'). Restituisce una lista di prodotti corrispondenti con ID, titolo e prezzo.",
    schema: z.object({
      query: z.string().describe("Il termine di ricerca da usare (es. 'scarpe', 'nero')")
    }),
  }
);

const generateQuoteTool = tool(
  async ({ service, budget }) => {
    return JSON.stringify({
      status: "Preventivo Generato",
      service: service,
      estimated_cost: budget || "1.200€",
      timeline: "2 settimane",
      message: "Il preventivo è stato registrato nel sistema. Il cliente può approvarlo direttamente."
    });
  },
  {
    name: "generate_quote",
    description: "Genera un preventivo per un servizio creativo (es. video, branding, spot). Restituisce un JSON con i dettagli del preventivo.",
    schema: z.object({
      service: z.string().describe("Il tipo di servizio richiesto (es. 'Spot Cinematico', 'Reel TikTok')"),
      budget: z.string().optional().describe("Il budget stimato, se applicabile.")
    })
  }
);

const tools = [searchCatalogTool, generateQuoteTool];
const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));
const llmWithTools = llm ? llm.bindTools(tools) : null;

const GraphState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [],
  },
  profile: {
    value: (x, y) => y,
    default: () => null,
  }
};

async function agentNode(state) {
  const profile = state.profile || {};
  const profileContext = profile.name 
    ? `Il cliente si chiama ${profile.name}. ${profile.email ? 'Email: ' + profile.email : ''}` 
    : "L'utente è anonimo.";
  
  const systemMessage = new SystemMessage(`
    Sei l'Agente Elisee, un Personal Stylist e Creative Director per l'app e-commerce "Elisee".
    
    Il tuo compito è aiutare i clienti a:
    1. Trovare abbigliamento esclusivo e di alta qualità nello shop.
    2. Creare pacchetti e preventivi per progetti visivi/creativi (spot, reel, branding).
    
    ${profileContext}
    
    REGOLE IMPORTANTI:
    - Sii formale ma accogliente, usa un tono premium ed esclusivo.
    - Se l'utente cerca un prodotto, DEVI usare il tool 'search_catalog'. Non inventare prodotti.
    - Se l'utente ti chiede un preventivo, DEVI usare il tool 'generate_quote' per calcolare i costi e presentare l'offerta in modo strutturato.
    - Quando formatti l'output usa SOLO tag HTML validi (come <br>, <b>, <i>, <ul>, <li>) perché il testo verrà renderizzato con innerHTML. Non usare markdown!
    - Se suggerisci un prodotto o un preventivo, includi un bottone per l'azione. Ad esempio:
      <button class="btn-primary" style="height:32px; font-size:11px; margin-top:8px;" onclick="toast('Azione eseguita!')">Aggiungi al carrello</button>
  `);

  const response = await llmWithTools.invoke([systemMessage, ...state.messages]);
  return { messages: [response] };
}

async function toolNode(state) {
  const results = [];
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (lastMessage?.tool_calls?.length) {
    for (const toolCall of lastMessage.tool_calls) {
      const tool = toolsByName[toolCall.name];
      if (tool) {
        const observation = await tool.invoke(toolCall.args);
        results.push(new ToolMessage({
          content: observation,
          tool_call_id: toolCall.id,
          name: toolCall.name,
        }));
      }
    }
  }
  return { messages: results };
}

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.tool_calls?.length) {
    return "tools";
  }
  return END;
}

const workflow = new StateGraph({ channels: GraphState })
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const memory = new MemorySaver();

export const eliseeAgent = llm 
  ? workflow.compile({ checkpointer: memory })
  : { 
      invoke: async () => ({
        messages: [{
          content: "L'Agente AI è attualmente in modalità offline perché manca la chiave API di Google. Inseriscila nel file .env e riavvia il server."
        }]
      })
    };
