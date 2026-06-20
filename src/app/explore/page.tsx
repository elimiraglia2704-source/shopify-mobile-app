import CatalogVirtual from '@/components/CatalogVirtual';
import { getProducts } from '@/lib/shopify';
import { Suspense } from 'react';
import { Search } from 'lucide-react';

async function CatalogData() {
  const { products } = await getProducts(50);
  return <CatalogVirtual initialProducts={products} />;
}

function CatalogSkeleton() {
  return (
    <>
      <div className="catalog-top">
        <div className="search-wrap">
          <Search className="search-ico opacity-50" />
          <input type="text" className="search-field" placeholder="Caricamento catalogo..." disabled />
        </div>
      </div>
      <div style={{ padding: '0 14px', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="prod-card" style={{ opacity: 0.5 }}>
            <div className="prod-img-wrap" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
            <div className="prod-body">
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px', width: '80%' }}></div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '40%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="pt-2">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogData />
      </Suspense>
    </div>
  );
}
