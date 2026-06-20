'use client';

type Product = {
  id: string;
  title: string;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images?: { url: string }[];
};

export default function ProductList({ products }: { products: Product[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
      {products.map((product) => (
        <div key={product.id} style={{ width: '200px', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
          {product.images?.[0] && (
            <img src={product.images[0].url} alt={product.title} style={{ width: '100%', height: 'auto' }} />
          )}
          <h3>{product.title}</h3>
          <p>
            {product.priceRange?.minVariantPrice?.amount}{' '}
            {product.priceRange?.minVariantPrice?.currencyCode}
          </p>
        </div>
      ))}
    </div>
  );
}
