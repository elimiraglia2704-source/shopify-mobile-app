import { getProducts, getCollections } from '@/lib/shopify';
import HomeClientWrapper from '@/components/HomeClientWrapper';

// Disable layout caching for dynamic collection loading
export const revalidate = 0;

export default async function Home() {
  const { products } = await getProducts(10);
  const collections = await getCollections();

  return (
    <HomeClientWrapper 
      initialProducts={products.slice(0, 10)} 
      initialCollections={collections} 
    />
  );
}
