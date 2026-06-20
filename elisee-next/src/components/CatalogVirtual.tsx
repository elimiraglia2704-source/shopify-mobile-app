'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { getProducts } from '@/lib/shopify';

export default function CatalogVirtual({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = 2;
  const rowCount = Math.ceil(products.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
  });

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
        <div className="search-wrap">
          <Search className="search-ico" />
          <input
            type="text"
            id="search-input"
            className="search-field"
            placeholder="Cerca un prodotto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="catalog-bar">
          <select className="sort-select" id="sort-select">
            <option value="">Ordina</option>
            <option value="price-asc">Prezzo ↑</option>
            <option value="price-desc">Prezzo ↓</option>
            <option value="az">A → Z</option>
          </select>
          <button className="wish-filter-btn" id="wish-filter-btn">
            Preferiti
          </button>
        </div>
      </div>

      <div 
        ref={parentRef}
        style={{ height: 'calc(100vh - 180px)', overflow: 'auto', paddingBottom: '80px' }}
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
                {rowProducts.map((p) => (
                  <div key={p.id} className="prod-card">
                    <div className="prod-img-wrap">
                      {p.images?.edges[0]?.node?.url ? (
                        <Image 
                          src={p.images.edges[0].node.url} 
                          alt={p.title} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="prod-img"
                        />
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
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
