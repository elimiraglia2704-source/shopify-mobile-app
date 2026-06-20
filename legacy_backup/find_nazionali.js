async function test() {
  try {
    const res = await fetch('https://eliseeshop.myshopify.com/products.json?limit=250');
    const data = await res.json();
    const products = data.products;
    const nazionali = products.filter(p => p.title.toLowerCase().includes('nazionale') || p.product_type.toLowerCase().includes('cover'));
    console.log("Found products:", nazionali.map(p => p.title));
  } catch (e) {
    console.log(e);
  }
}
test();
