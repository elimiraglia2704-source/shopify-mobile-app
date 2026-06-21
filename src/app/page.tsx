import { getProducts } from '@/lib/shopify';
import { Suspense } from 'react';
import { ChevronDown } from 'lucide-react';
import HomeProductsClient from '@/components/HomeProductsClient';

async function HomeProducts() {
  const { products } = await getProducts(10);
  const showcaseProducts = products.slice(0, 10);

  return <HomeProductsClient products={showcaseProducts} />;
}

function ProductsSkeleton() {
  return (
    <div className="home-section">
      <div className="section-head">
        <h2 className="section-title" style={{ fontFamily: 'var(--font-d)' }}>Ultimi arrivi</h2>
      </div>
      <div className="products-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="prod-card" style={{ opacity: 0.5, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="prod-img-wrap" style={{ background: 'rgba(255,255,255,0.05)', height: '180px' }}></div>
            <div className="prod-body" style={{ padding: '12px' }}>
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px', width: '30%' }}></div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px', width: '90%' }}></div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '16px', width: '60%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ height: '16px', background: 'rgba(212,175,55,0.2)', borderRadius: '4px', width: '40%' }}></div>
                <div style={{ height: '28px', width: '28px', background: 'rgba(155,89,208,0.15)', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div style={{ padding: '24px 16px 8px', marginTop: '10px' }}>
        <h1 id="hero-title" style={{ fontFamily: 'var(--font-d)', fontSize: '32px', marginBottom: '16px', fontWeight: 600 }}>Buonasera, Enea</h1>
        
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
          <select className="sort-select" style={{ width: '100%', padding: '14px 16px', background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', appearance: 'none' }}>
            <option>Tutte le Collezioni</option>
          </select>
          <ChevronDown size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <Suspense fallback={<ProductsSkeleton />}>
        <HomeProducts />
      </Suspense>

      <div style={{ height: '100px' }}></div>
    </>
  );
}
