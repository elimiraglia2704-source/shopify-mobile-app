import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2, Heart, ShoppingBag } from 'lucide-react';
import { queryStorefront } from '@/lib/shopify';

// Function to fetch a specific product by ID
async function getProductById(id: string) {
  // If id doesn't start with gid://, format it correctly
  const formattedId = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;
  
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        descriptionHtml
        vendor
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
        variants(first: 20) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await queryStorefront(query, { id: formattedId });
    return data.product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  // In Next.js 15 params is async, but we can treat it directly or await it based on Next.js 15 strict mode.
  // We decode the URI component in case it was url-encoded.
  const decodedId = decodeURIComponent(params.id);
  const product = await getProductById(decodedId);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-white text-xl">Prodotto non trovato</h2>
        <Link href="/explore" className="btn-primary mt-4">Torna al catalogo</Link>
      </div>
    );
  }

  const imageUrl = product.images?.edges[0]?.node?.url;
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2);

  return (
    <div className="bg-[#0f0f0f] min-h-screen pb-24">
      {/* Header Modal/Page */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-[#0a0a0a]/90 to-transparent">
        <Link href="/explore" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Slider Area */}
      <div className="relative w-full aspect-square -mt-16 z-0 bg-[#1a1a1a]">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.title} 
            fill 
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }} 
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-4 bg-[#0f0f0f] -mt-6 relative z-10 rounded-t-3xl border-t border-white/10">
        <div className="flex justify-between items-start mb-2 mt-2">
          <h1 className="text-2xl font-bold text-white leading-tight pr-4">{product.title}</h1>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#ffd700] whitespace-nowrap">
            € {price}
          </div>
        </div>
        
        <p className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">{product.vendor}</p>

        {/* Variants Selector */}
        {product.variants.edges.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Seleziona Modello</h3>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {product.variants.edges.map((v: any, index: number) => (
                <button 
                  key={v.node.id} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition border ${index === 0 ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] text-gray-300 border-white/20 hover:border-white/50'}`}
                >
                  {v.node.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-sm font-bold text-white mb-2">Descrizione</h3>
          <div 
            className="text-gray-400 text-[14px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml || 'Nessuna descrizione disponibile.' }}
          />
        </div>

        {/* Add to Cart Button Sticky at Bottom */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-40">
          <button className="w-full h-14 bg-white text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-transform">
            <ShoppingBag size={22} />
            Aggiungi al Carrello
          </button>
        </div>
      </div>
    </div>
  );
}
