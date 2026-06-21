'use client';

import { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { Search, Heart, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CatalogVirtual({ 
  initialProducts, 
  collections = [] 
}: { 
  initialProducts: any[]; 
  collections?: any[]; 
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [animatingHearts, setAnimatingHearts] = useState<{ [productId: string]: boolean }>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columns = 2;

  // Caricamento preferiti da LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('elisee:favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Previene l'apertura automatica della tastiera all'avvio
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
      const timer = setTimeout(() => {
        inputRef.current?.blur();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Query Shopify Storefront API quando cambiano ricerca o collezione
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        let gql = '';
        let variables: any = {};

        if (selectedCollection) {
          gql = `
            query getCollectionProducts($handle: String!, $first: Int!) {
              collection(handle: $handle) {
                products(first: $first) {
                  edges {
                    node {
                      id
                      title
                      priceRange {
                        minVariantPrice {
                          amount
                          currencyCode
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;
          variables = { handle: selectedCollection, first: 100 };
        } else {
          gql = `
            query getProducts($first: Int!, $query: String) {
              products(first: $first, query: $query) {
                edges {
                  node {
                    id
                    title
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          `;
          variables = {
            first: 100,
            query: search.trim() ? `title:*${search}* OR tag:*${search}*` : undefined
          };
        }

        const res = await fetch('/api/shopify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: gql, variables })
        });

        const data = await res.json();

        if (selectedCollection) {
          const colProducts = data.data?.collection?.products?.edges?.map((e: any) => e.node) || [];
          if (search.trim()) {
            setProducts(colProducts.filter((p: any) =>
              p.title.toLowerCase().includes(search.toLowerCase())
            ));
          } else {
            setProducts(colProducts);
          }
        } else {
          const allProducts = data.data?.products?.edges?.map((e: any) => e.node) || [];
          setProducts(allProducts);
        }
      } catch (err) {
        console.error("Shopify search failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, selectedCollection]);

  // Gestione click preferiti con animazione di volo
  const toggleFavorite = (productId: string) => {
    const isFav = favorites.includes(productId);
    if (!isFav) {
      setAnimatingHearts(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setFavorites(prev => {
          const updated = [...prev, productId];
          localStorage.setItem('elisee:favorites', JSON.stringify(updated));
          return updated;
        });
        setAnimatingHearts(prev => ({ ...prev, [productId]: false }));
      }, 600);
    } else {
      setFavorites(prev => {
        const updated = prev.filter(id => id !== productId);
        localStorage.setItem('elisee:favorites', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Filtra collezioni inutili e le ordina alfabeticamente
  const sortedCollections = [...collections]
    .filter((col: any) => col.handle !== 'frontpage' && col.title !== 'Homepage')
    .sort((a: any, b: any) => a.title.localeCompare(b.title));

  // Filtra i preferiti se attivo il toggle
  const filteredList = showFavoritesOnly 
    ? products.filter((p: any) => favorites.includes(p.id))
    : products;

  // Applica ordinamento client-side
  const sortedProducts = [...filteredList].sort((a: any, b: any) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.priceRange?.minVariantPrice?.amount || '0') - parseFloat(b.priceRange?.minVariantPrice?.amount || '0');
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.priceRange?.minVariantPrice?.amount || '0') - parseFloat(a.priceRange?.minVariantPrice?.amount || '0');
    }
    if (sortBy === 'az') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const rowCount = Math.ceil(sortedProducts.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 5,
  });

  return (
    <>
      <div className="catalog-top" style={{ padding: '0 14px' }}>
        {/* Campo Ricerca */}
        <div className="search-wrap" style={{ position: 'relative', marginBottom: '12px' }}>
          <Search className="search-ico" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '18px', height: '18px' }} />
          <input
            ref={inputRef}
            type="text"
            id="search-input"
            className="search-field"
            placeholder="Cerca prodotti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: '#0a0010', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '14px', height: '50px', padding: '0 40px 0 44px' }}
          />
          {isLoading ? (
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
            </div>
          ) : (
            search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
              </button>
            )
          )}
        </div>
        
        {/* Dropdown Collezioni Dinamico */}
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <select 
            className="sort-select" 
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{ width: '100%', background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '14px', appearance: 'none', height: '50px', padding: '0 16px' }}
          >
            <option value="">Tutte le Collezioni</option>
            {sortedCollections.map((col: any) => (
              <option key={col.id} value={col.handle}>{col.title}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
            ▼
          </div>
        </div>

        {/* Ordinamento & Filtro Preferiti */}
        <div className="catalog-bar" style={{ display: 'flex', gap: '8px' }}>
          <select 
            className="sort-select" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ flex: 1, background: '#0a0010', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '14px', appearance: 'none', height: '40px', padding: '0 16px' }}
          >
            <option value="">Ordina</option>
            <option value="price-asc">Prezzo ↑</option>
            <option value="price-desc">Prezzo ↓</option>
            <option value="az">A → Z</option>
          </select>
          
          <button 
            className="wish-filter-btn" 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ 
              background: '#0a0010', 
              border: showFavoritesOnly ? '1px solid var(--purple)' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', 
              padding: '0 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              color: showFavoritesOnly ? 'var(--purple-light)' : 'rgba(255,255,255,0.8)', 
              height: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Heart size={14} fill={showFavoritesOnly ? "var(--purple-light)" : "none"} /> Preferiti
          </button>
        </div>
      </div>

      {/* Griglia Prodotti */}
      <div 
        ref={parentRef}
        style={{ height: 'calc(100vh - 250px)', overflow: 'auto', paddingBottom: '80px', marginTop: '16px' }}
      >
        {sortedProducts.length === 0 ? (
          <div className="catalog-empty" style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.4)' }}>
            <Heart size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p>Nessun prodotto corrisponde ai criteri di ricerca.</p>
          </div>
        ) : (
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
              const rowProducts = sortedProducts.slice(startIndex, startIndex + columns);

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
                    const isHot = index === 1 && !showFavoritesOnly;
                    const imgUrl = p.images?.edges?.[0]?.node?.url || p.images?.[0]?.url || '';
                    const isFav = favorites.includes(p.id);
                    const isAnimating = animatingHearts[p.id];

                    return (
                      <Link 
                        key={p.id} 
                        href={`/product/${p.id.split('/').pop()}`} 
                        className="prod-card" 
                        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                      >
                        <div className="prod-img-wrap" style={{ position: 'relative', height: '180px', width: '100%' }}>
                          {imgUrl ? (
                            <Image src={imgUrl} alt={p.title} fill className="prod-img" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 250px" loading={virtualRow.index < 4 ? "eager" : "lazy"} />
                          ) : (
                            <div className="w-full h-full bg-gray-800" />
                          )}
                          
                          {/* Heart Button Interattivo */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            style={{ 
                              position: 'absolute', 
                              top: '8px', 
                              right: '8px', 
                              background: 'rgba(0,0,0,0.5)', 
                              borderRadius: '50%', 
                              width: '28px', 
                              height: '28px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              backdropFilter: 'blur(4px)',
                              border: 'none',
                              cursor: 'pointer',
                              zIndex: 20
                            }}
                          >
                            <Heart 
                              size={14} 
                              color={isFav ? '#e53e3e' : '#ccc'} 
                              fill={isFav ? '#e53e3e' : 'none'} 
                              style={{ transition: 'all 0.2s' }} 
                            />
                          </button>

                          {/* Flying Heart Animation Container */}
                          {isAnimating && (
                            <div className="flying-heart" style={{
                              position: 'absolute',
                              zIndex: 30,
                              pointerEvents: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px'
                            }}>
                              <Heart size={14} color="#e53e3e" fill="#e53e3e" />
                            </div>
                          )}

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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
