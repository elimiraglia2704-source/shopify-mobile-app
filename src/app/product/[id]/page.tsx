'use server';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, Share2, Heart, ShoppingBag } from 'lucide-react';
import { queryStorefront } from '@/lib/shopify';

// ─── Tipi ────────────────────────────────────────────────────────────────────
interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

interface ShopifyProduct {
  id: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: ProductVariant }[] };
}

// ─── Fetch Prodotto ───────────────────────────────────────────────────────────
async function getProductById(id: string): Promise<ShopifyProduct | null> {
  const formattedId = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;

  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id title descriptionHtml vendor
        priceRange { minVariantPrice { amount currencyCode } }
        images(first: 5) { edges { node { url altText } } }
        variants(first: 20) {
          edges { node { id title availableForSale price { amount currencyCode } } }
        }
      }
    }
  `;

  try {
    const data = await queryStorefront(query, { id: formattedId });
    return data.product ?? null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// ─── Componente Dettagli (asincrono, wrappato in Suspense) ────────────────────
async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const product   = await getProductById(decodedId);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>
          Prodotto non trovato
        </h2>
        <Link href="/shop" className="btn-primary">
          Torna al catalogo
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images   = product.images as any;
  const imageUrl = images?.edges?.[0]?.node?.url || images?.[0]?.url || '';
  const price    = parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2);

  return (
    <>
      {/* Immagine principale */}
      <div className="relative w-full aspect-square -mt-16 z-0" style={{ background: '#1a1a1a' }}>
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
          <div style={{ width: '100%', height: '100%', background: '#333' }} />
        )}
      </div>

      {/* Dettagli prodotto */}
      <div
        className="p-4 -mt-6 relative z-10 rounded-t-3xl"
        style={{ background: 'rgba(10, 0, 16, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', marginTop: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', lineHeight: 1.3, paddingRight: '16px' }}>
            {product.title}
          </h1>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--gold)',
              whiteSpace: 'nowrap',
            }}
          >
            € {price}
          </div>
        </div>

        <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {product.vendor}
        </p>

        {/* Selezione variante */}
        {product.variants.edges.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
              Seleziona Modello
            </h3>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px' }}>
              {product.variants.edges.map((v, index) => (
                <button
                  key={v.node.id}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: index === 0 ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                    background: index === 0 ? 'white' : '#1a1a1a',
                    color: index === 0 ? 'black' : '#d1d5db',
                    cursor: 'pointer',
                  }}
                >
                  {v.node.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descrizione */}
        <div style={{ marginBottom: '120px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            Descrizione
          </h3>
          <div
            style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml || 'Nessuna descrizione disponibile.',
            }}
          />
        </div>
      </div>
    </>
  );
}

// ─── Skeleton di caricamento ──────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <>
      <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a' }} />
      <div style={{ padding: '16px', background: '#0f0f0f', marginTop: '-24px', borderRadius: '24px 24px 0 0' }}>
        <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', width: '70%' }} />
        <div style={{ height: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '24px', width: '30%' }} />
        <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '8px', width: '100%' }} />
        <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', width: '80%' }} />
      </div>
    </>
  );
}

// ─── Pagina Prodotto (Page Component) ────────────────────────────────────────
// In Next.js 16, params è una Promise: va passata direttamente ai componenti
// che la risolvono internamente, garantendo streaming e navigazioni istantanee.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '96px' }}>
      {/* Header fisso */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'linear-gradient(to bottom, rgba(10,0,16,0.85) 0%, transparent 100%)',
        }}
      >
        <Link
          href="/shop"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} />
          </button>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Contenuto prodotto con Suspense per streaming */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>

      {/* Pulsante "Aggiungi al carrello" fisso */}
      <div
        style={{
          position: 'fixed',
          bottom: '64px',
          left: 0,
          right: 0,
          padding: '16px',
          background: 'linear-gradient(to top, rgba(10, 0, 16, 0.95) 50%, transparent 100%)',
          zIndex: 40,
        }}
      >
        <button
          style={{
            width: '100%',
            height: '56px',
            background: 'white',
            color: 'black',
            fontWeight: 700,
            fontSize: '16px',
            borderRadius: '16px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,255,255,0.15)',
          }}
        >
          <ShoppingBag size={22} />
          Aggiungi al Carrello
        </button>
      </div>
    </div>
  );
}
