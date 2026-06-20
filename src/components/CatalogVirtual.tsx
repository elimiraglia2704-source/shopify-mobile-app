'use client';

import { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { Search, Heart, Plus } from 'lucide-react';

export default function CatalogVirtual({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columns = 2;
  const rowCount = Math.ceil(products.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 5,
  });

  // Previene l'apertura automatica della tastiera all'apertura del catalogo
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
      const timer = setTimeout(() => {
        inputRef.current?.blur();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length > 2) {
        const filtered = initialProducts.filter(p => 
          p.title.toLowerCase().includes(search.toLowerCase())
        );
        setProducts(filtered);
      } else if (search.trim().length === 0) {
        setProducts(initialProducts);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, initialProducts]);

  return (
    <>
      <div className="catalog-top">
        <div className="search-wrap" style={{ position: 'relative', marginBottom: '12px' }}>
          <Search className="search-ico" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '18px', height: '18px' }} />
          <input
            ref={inputRef}
            type="text"
            id="search-input"
            className="search-field"
            placeholder="Es. scarpe da running leggere..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: '#0a0010', border: '1px solid rgba(155,89,208,0.3)', borderRadius: '12px', color: 'white', fontSize: '14px', height: '50px', padding: '0 16px 0 44px' }}
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <select className="sort-select" style={{ width: '100%', background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '14px', appearance: 'none', height: '50px', padding: '0 16px' }}>
            <option>Tutte le Collezioni</option>
          </select>
        </div>

        <div className="catalog-bar" style={{ display: 'flex', gap: '8px' }}>
          <select className="sort-select" style={{ flex: 1, background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '14px', appearance: 'none', height: '40px', padding: '0 16px' }}>
            <option value="">Ordina</option>
            <option value="price-asc">Prezzo ↑</option>
            <option value="price-desc">Prezzo ↓</option>
            <option value="az">A → Z</option>
          </select>
          <button className="wish-filter-btn" style={{ background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', height: '40px' }}>
            <Heart size={14} /> Preferiti
          </button>
        </div>
      </div>

      {search.trim().length === 0 ? (
        <div className="catalog-landing" style={{ padding: '24px 16px', paddingBottom: '100px' }}>
          <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '22px', marginBottom: '16px', fontWeight: 600 }}>Novità e in evidenza</h3>
          
          <div className="h-scrollable-cards" style={{ gap: '16px', marginBottom: '32px', display: 'flex', overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ minWidth: '240px', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden' }}>
                <Image src="/ciabatte-esive.jpg" alt="Ciabatte Estive" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 80vw, 300px" />
              </div>
              <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600 }}>Ciabatte Estive</p>
            </div>
            <div style={{ minWidth: '240px', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden' }}>
                <Image src="/camicie.jpg" alt="Camicie" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 80vw, 300px" />
              </div>
              <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600 }}>Camicie</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '32px' }}>
            <div onClick={() => setSearch('Cappelli Pescatore')} style={{ position: 'relative', height: '160px', overflow: 'hidden', cursor: 'pointer', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
              <Image src="/cappelli-pescatore.webp" alt="Cappelli Pescatore" fill style={{ objectFit: 'cover', objectPosition: 'right center' }} sizes="(max-width: 768px) 100vw, 600px" />
              <h4 style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: '20px', fontWeight: 600, color: '#fff' }}>Cappelli Pescatore</h4>
            </div>
            
            <div onClick={() => setSearch('Cappelli Bimbi')} style={{ position: 'relative', height: '160px', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
              <Image src="/cappelli-bimbi.png" alt="Cappelli Bimbi" fill style={{ objectFit: 'cover', objectPosition: 'right center' }} sizes="(max-width: 768px) 100vw, 600px" />
              <h4 style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: '20px', fontWeight: 600, color: '#fff' }}>Cappelli Bimbi</h4>
            </div>
            
            <div onClick={() => setSearch('Tazze da tè')} style={{ position: 'relative', height: '160px', overflow: 'hidden', cursor: 'pointer', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
              <Image src="/tazze-da-tè.webp" alt="Tazze da tè" fill style={{ objectFit: 'cover', objectPosition: 'right center' }} sizes="(max-width: 768px) 100vw, 600px" />
              <h4 style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: '20px', fontWeight: 600, color: '#fff' }}>Tazze da tè</h4>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '22px', marginBottom: '24px', fontWeight: 600 }}>Acquista per nazionale</h3>
          <div className="h-scrollable-squares" style={{ gap: '24px', display: 'flex', overflowX: 'auto', paddingBottom: '16px' }}>
            {[
              { name: 'Argentina', flag: 'ar' },
              { name: 'Arabia Saudita', flag: 'sa' },
              { name: 'Austria', flag: 'at' }
            ].map(team => (
              <div key={team.name} onClick={() => setSearch(team.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '80px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)', position: 'relative', marginBottom: '12px' }}>
                  <img src={`https://flagcdn.com/w160/${team.flag}.png`} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{ fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>{team.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div 
          ref={parentRef}
          style={{ height: 'calc(100vh - 180px)', overflow: 'auto', paddingBottom: '80px', marginTop: '16px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
            className="catalog-grid products-grid"
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowProducts = products.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '9px',
                    padding: '0 14px'
                  }}
                >
                  {rowProducts.map((p, index) => {
                    const isHot = index === 1; // Fake hot badge for search results
                    return (
                      <div key={p.id} className="prod-card" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="prod-img-wrap" style={{ position: 'relative', height: '180px', width: '100%' }}>
                          {p.images?.edges[0]?.node?.url ? (
                            <Image src={p.images.edges[0].node.url} alt={p.title} fill className="prod-img" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 250px" loading={virtualRow.index < 4 ? "eager" : "lazy"} />
                          ) : (
                            <div className="w-full h-full bg-gray-800" />
                          )}
                          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <Heart size={14} color="#ccc" />
                          </div>
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
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
