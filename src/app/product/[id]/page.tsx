import Link from 'next/link';
import { Suspense } from 'react';
import { queryStorefront } from '@/lib/shopify';
import ProductClientView from './ProductClientView';

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
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh', padding: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>
          Prodotto non trovato
        </h2>
        <Link href="/shop" className="btn-primary" style={{ padding: '12px 24px', background: 'var(--gold)', color: 'black', borderRadius: '12px', fontWeight: 600 }}>
          Torna al catalogo
        </Link>
      </div>
    );
  }

  return <ProductClientView product={product} />;
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
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}
