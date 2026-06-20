'use client';

import { Card, Text } from '@shopify/polaris';
import { getProducts } from '@/lib/shopify';
import ProductList from './ProductList';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images?: { url: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts(12)
      .then((data) => {
        setProducts(data.products);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <Text as="h2" variant="headingLg">
        Prodotti Shopify
      </Text>
      {loading ? (
        <Text as="p">Caricamento...</Text>
      ) : (
        <ProductList products={products} />
      )}
    </Card>
  );
}
