import CatalogVirtual from '@/components/CatalogVirtual';
import { getProducts } from '@/lib/shopify';

export default async function ExplorePage() {
  // Fetch a large number of products on the server side
  // In a real app we might paginate or load all if under ~2000.
  const { products } = await getProducts(250); 
  
  return (
    <div className="pt-2">
      <CatalogVirtual initialProducts={products} />
    </div>
  );
}
