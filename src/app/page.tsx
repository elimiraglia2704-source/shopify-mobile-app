import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import { Suspense } from 'react';
import { Heart, Plus, ChevronDown } from 'lucide-react';

async function HomeProducts() {
  const { products } = await getProducts(10);
  const showcaseProducts = products.slice(0, 10);

  return (
    <>
      <div className="home-section">
        <div className="section-head">
          <h2 className="section-title">Ultimi arrivi</h2>
        </div>
        <div className="products-grid">
          {showcaseProducts.map((p: any, index: number) => {
            const isHot = index === 2; // Add a hot badge to the 3rd item just like screenshot
            const imgUrl = p.images?.edges?.[0]?.node?.url || p.images?.[0]?.url || '';
            return (
              <Link key={p.id} href={`/explore`} className="prod-card" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="prod-img-wrap" style={{ position: 'relative', height: '180px', width: '100%' }}>
                  {imgUrl ? (
                    <Image src={imgUrl} alt={p.title} fill className="prod-img" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  {/* Heart button */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <Heart size={14} color="#ccc" />
                  </div>
                  {/* Hot badge */}
                  {isHot && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(90deg, #ff3b30, #ff9500)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                      🔥 MOLTO RICHIESTO
                    </div>
                  )}
                </div>
                <div className="prod-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>ELISEE</p>
                  <h4 className="prod-title" style={{ fontSize: '14px', lineHeight: 1.3, marginBottom: '12px', flex: 1, fontFamily: 'var(--font-d)' }}>
                    {p.title.length > 50 ? p.title.substring(0, 50) + '...' : p.title}
                  </h4>
                  <div className="prod-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className="prod-price" style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '15px' }}>
                      €{parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}
                    </span>
                    <div style={{ background: 'rgba(155,89,208,0.15)', color: 'var(--purple-light)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.3)' }}>
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
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
        <h1 id="hero-title" style={{ fontFamily: 'var(--font-d)', fontSize: '32px', marginBottom: '16px', fontWeight: 600 }}>Buongiorno, Enea</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Image src="/logo-total-white.png" alt="Sport" width={20} height={20} style={{ opacity: 0.8 }} />
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
