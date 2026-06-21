'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images?: {
    edges?: {
      node: {
        url: string;
      };
    }[];
  };
}

export default function HomeProductsClient({ products, title = "Ultimi arrivi" }: { products: Product[]; title?: string }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('elisee:favorites') : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [animatingHearts, setAnimatingHearts] = useState<{ [productId: string]: boolean }>({});

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

  return (
    <div className="home-section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="products-grid">
        {products.map((p: Product) => {
          const imgUrl = p.images?.edges?.[0]?.node?.url || '';
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
                  <Image src={imgUrl} alt={p.title} fill className="prod-img" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 250px" />
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

                {/* Flying Heart Animation */}
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
  );
}
