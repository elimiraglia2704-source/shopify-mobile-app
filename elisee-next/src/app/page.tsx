import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import { Suspense } from 'react';

async function HomeProducts() {
  const { products } = await getProducts(10);
  const aiProducts = products.slice(0, 4);
  const showcaseProducts = products.slice(4, 10);

  return (
    <>
      <div className="home-section">
        <div className="section-head">
          <h2 className="section-title">Ultimi arrivi</h2>
        </div>
        <div className="products-grid">
          {showcaseProducts.map((p: any) => (
            <Link key={p.id} href={`/explore`} className="prod-card">
              <div className="prod-img-wrap">
                {p.images?.edges[0]?.node?.url ? (
                  <Image src={p.images.edges[0].node.url} alt={p.title} fill className="prod-img" />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="prod-body">
                <h4 className="prod-title">{p.title}</h4>
                <div className="prod-foot">
                  <div className="prod-prices">
                    <span className="prod-price">€ {parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-head">
          <h2 className="section-title">Per te <span className="section-ai-badge">AI</span></h2>
          <Link href="/explore" className="link-btn">Vedi tutti</Link>
        </div>
        <div className="products-grid">
          {aiProducts.map((p: any) => (
            <Link key={p.id} href={`/explore`} className="prod-card">
              <div className="prod-img-wrap">
                {p.images?.edges[0]?.node?.url ? (
                  <Image src={p.images.edges[0].node.url} alt={p.title} fill className="prod-img" />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="prod-body">
                <h4 className="prod-title">{p.title}</h4>
                <div className="prod-foot">
                  <div className="prod-prices">
                    <span className="prod-price">€ {parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ProductsSkeleton() {
  return (
    <div className="home-section">
      <div className="section-head">
        <h2 className="section-title">Caricamento prodotti...</h2>
      </div>
      <div className="products-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="prod-card" style={{ opacity: 0.5 }}>
            <div className="prod-img-wrap" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
            <div className="prod-body">
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px', width: '80%' }}></div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '40%' }}></div>
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
      <div className="hero" id="home-hero">
        <Image 
          src="/cover.png" 
          alt="Hero" 
          fill 
          sizes="100vw"
          priority 
          className="hero-img"
        />
        <div className="hero-overlay">
          <h2 className="hero-title">Inverno 2026</h2>
          <p className="hero-sub">Le migliori collezioni</p>
          <Link href="/explore" className="btn-primary hero-cta">
            Acquista Ora
          </Link>
        </div>
      </div>

      <div className="home-section">
        <div className="section-head">
          <h2 className="section-title">Collezioni</h2>
        </div>
        <div className="h-scrollable-cards">
          <div className="highlight-card">
            <div className="img-wrapper relative h-[150px] w-[150px]">
              <Image src="/ciabatte-esive.jpg" alt="Ciabatte" fill className="object-cover" />
            </div>
            <p>Ciabatte Estive</p>
          </div>
          <div className="highlight-card">
            <div className="img-wrapper relative h-[150px] w-[150px]">
              <Image src="/camicie.jpg" alt="Camicie" fill className="object-cover" />
            </div>
            <p>Camicie</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ProductsSkeleton />}>
        <HomeProducts />
      </Suspense>

      <p className="home-footer-note" style={{textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', padding: '20px 0'}}>© 2026 Elisee — Tutti i diritti riservati</p>
    </>
  );
}
