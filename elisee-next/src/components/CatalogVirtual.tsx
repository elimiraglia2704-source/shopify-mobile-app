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

  // Per mobile di solito abbiamo 2 colonne
  const columns = 2;
  const rowCount = Math.ceil(products.length / columns);

  // Virtualizzazione
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Altezza stimata della product-card (immagine 200px + info)
    overscan: 5, // Renderizza 5 righe fuori schermo per fluidità
  });

  // Funzione di debounce semplice per la ricerca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length > 2) {
        // Simuliamo una chiamata di ricerca
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
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header Fissato / Barra di Ricerca */}
      <div className="p-4 shrink-0 bg-[#0a0a0a] border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca un prodotto..."
            className="w-full bg-[#1a1a1a] text-white border border-white/20 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Contenitore Virtualizzato Scrollabile */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-auto p-4"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
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
                }}
                className="flex gap-4 pb-4" // pb-4 al posto del gap grid
              >
                {rowProducts.map((p) => (
                  <div key={p.id} className="flex-1 min-w-0 bg-[#141414] rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col relative transition-transform hover:-translate-y-1">
                    <div className="relative w-full h-[200px]">
                      {p.images?.edges[0]?.node?.url ? (
                        <Image 
                          src={p.images.edges[0].node.url} 
                          alt={p.title} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800" />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-[13px] font-medium text-gray-100 truncate mb-1">{p.title}</h4>
                      <div className="text-[14px] font-bold text-white">
                        € {parseFloat(p.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Spazio vuoto se l'ultima riga è dispari */}
                {rowProducts.length < columns && (
                  <div className="flex-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
