import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/shopify';

// Server Component for the Home Page
export default async function Home() {
  // Fetch products server-side
  const { products } = await getProducts(10);
  const aiProducts = products.slice(0, 4); // Simulate AI products
  const showcaseProducts = products.slice(4, 10);

  return (
    <>
      <div className="search-container sticky top-[56px] z-40 bg-[#0a0a0a]">
        <div className="search-box">
          <input type="text" id="search-input" placeholder="Cerca prodotti, collezioni..." />
        </div>
        <div id="search-results" className="search-results hidden"></div>
      </div>

      <div className="hero mt-4">
        <div className="hero-bg">
          <Image 
            src="/hero-bg.webp" 
            alt="Hero Background" 
            fill 
            sizes="100vw"
            priority 
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="hero-content">
          <div className="hero-tag">Nuova Collezione</div>
          <h1 id="hero-title" className="hero-title">Inverno 2026</h1>
          <p className="hero-subtitle">Le migliori cover per il tuo smartphone</p>
          <Link href="/explore" className="btn-primary">Scopri di più</Link>
        </div>
      </div>

      <div className="p-4 mt-4">
        <h3 className="shop-section-title">Novità e in evidenza</h3>
        <div className="h-scrollable-cards">
          <div className="highlight-card">
            <div className="img-wrapper relative h-[150px] w-[150px]">
              <Image src="/ciabatte-esive.jpg" alt="Ciabatte Estive" fill style={{objectFit: 'cover'}} />
            </div>
            <p>Ciabatte Estive</p>
          </div>
          <div className="highlight-card">
            <div className="img-wrapper relative h-[150px] w-[150px]">
              <Image src="/camicie.jpg" alt="Camicie" fill style={{objectFit: 'cover'}} />
            </div>
            <p>Camicie</p>
          </div>
          <div className="highlight-card">
            <div className="img-wrapper relative h-[150px] w-[150px]">
              <Image src="/cover.png" alt="Cover" fill style={{objectFit: 'cover'}} />
            </div>
            <p>Cover</p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2">
        <h3 className="shop-section-title">Acquista per nazionale</h3>
        <div className="h-scrollable-squares">
          {/* We'll add just a few for demonstration, the full list can be dynamically loaded */}
          <div className="team-card">
            <div className="square-bg" style={{overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a', padding: '6px'}}>
              <Image src="https://flagcdn.com/w80/br.png" alt="Brasile" width={80} height={60} style={{objectFit:'contain', borderRadius:'4px'}} />
            </div>
            <p>Brasile</p>
          </div>
          <div className="team-card">
            <div className="square-bg" style={{overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a', padding: '6px'}}>
              <Image src="https://flagcdn.com/w80/fr.png" alt="Francia" width={80} height={60} style={{objectFit:'contain', borderRadius:'4px'}} />
            </div>
            <p>Francia</p>
          </div>
          <div className="team-card">
            <div className="square-bg" style={{overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a', padding: '6px'}}>
              <Image src="https://flagcdn.com/w80/gb-eng.png" alt="Inghilterra" width={80} height={60} style={{objectFit:'contain', borderRadius:'4px'}} />
            </div>
            <p>Inghilterra</p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2">
        <div className="section-header-flex">
          <h3 className="shop-section-title ai-gradient">✨ Consigliati per te</h3>
        </div>
        <div className="product-grid">
          {aiProducts.map((p: any) => (
            <div key={p.id} className="product-card">
              <div className="product-image-container relative h-[200px] w-full">
                {p.images?.edges[0]?.node?.url ? (
                  <Image src={p.images.edges[0].node.url} alt={p.title} fill style={{objectFit:'cover'}} />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="product-info">
                <h4 className="product-title">{p.title}</h4>
                <div className="product-price">
                  € {parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 mt-2">
        <h3 className="shop-section-title">Prodotti in Vetrina</h3>
        <div className="product-grid">
          {showcaseProducts.map((p: any) => (
            <div key={p.id} className="product-card">
              <div className="product-image-container relative h-[200px] w-full">
                {p.images?.edges[0]?.node?.url ? (
                  <Image src={p.images.edges[0].node.url} alt={p.title} fill style={{objectFit:'cover'}} />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="product-info">
                <h4 className="product-title">{p.title}</h4>
                <div className="product-price">
                  € {parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
