export const MOCK_PRODUCTS = [
  {
    id: "gid://shopify/Product/mock-1",
    title: "T-Shirt Classic Elisee",
    vendor: "ELISEE",
    description: "T-Shirt classica in cotone premium, perfetta per ogni occasione.",
    availableForSale: true,
    priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "EUR" } },
    images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80" } }] },
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }, { name: "Color", values: ["White", "Black"] }],
    variants: { edges: [
      { node: { id: "mock-v-1", title: "S / White", price: { amount: "29.99", currencyCode: "EUR" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "S" }, { name: "Color", value: "White" }] } },
      { node: { id: "mock-v-2", title: "M / White", price: { amount: "29.99", currencyCode: "EUR" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "M" }, { name: "Color", value: "White" }] } }
    ] },
    collections: { edges: [{ node: { id: "mock-col-1" } }] }
  },
  {
    id: "gid://shopify/Product/mock-2",
    title: "Felpa Hoodie Essential",
    vendor: "ELISEE",
    description: "Felpa con cappuccio dal fit rilassato.",
    availableForSale: true,
    priceRange: { minVariantPrice: { amount: "59.99", currencyCode: "EUR" } },
    images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80" } }] },
    options: [{ name: "Size", values: ["M", "L"] }, { name: "Color", values: ["Grey"] }],
    variants: { edges: [
      { node: { id: "mock-v-3", title: "M / Grey", price: { amount: "59.99", currencyCode: "EUR" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "M" }, { name: "Color", value: "Grey" }] } }
    ] },
    collections: { edges: [{ node: { id: "mock-col-1" } }] }
  },
  {
    id: "gid://shopify/Product/mock-3",
    title: "Sneakers Urban",
    vendor: "ELISEE",
    description: "Sneakers dal design urbano e moderno.",
    availableForSale: true,
    priceRange: { minVariantPrice: { amount: "120.00", currencyCode: "EUR" } },
    images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80" } }] },
    options: [{ name: "Size", values: ["40", "41", "42", "43"] }],
    variants: { edges: [
      { node: { id: "mock-v-4", title: "42", price: { amount: "120.00", currencyCode: "EUR" }, compareAtPrice: { amount: "150.00", currencyCode: "EUR" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "42" }] } }
    ] },
    collections: { edges: [{ node: { id: "mock-col-2" } }] }
  },
  {
    id: "gid://shopify/Product/mock-4",
    title: "Giacca a Vento Sport",
    vendor: "ELISEE",
    description: "Giacca a vento leggera e traspirante per lo sport.",
    availableForSale: true,
    priceRange: { minVariantPrice: { amount: "85.00", currencyCode: "EUR" } },
    images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80" } }] },
    options: [{ name: "Size", values: ["M", "L", "XL"] }],
    variants: { edges: [
      { node: { id: "mock-v-5", title: "L", price: { amount: "85.00", currencyCode: "EUR" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "L" }] } }
    ] },
    collections: { edges: [{ node: { id: "mock-col-1" }, node: { id: "mock-col-2" } }] }
  }
];

export const MOCK_COLLECTIONS = [
  { id: "mock-col-1", title: "Abbigliamento" },
  { id: "mock-col-2", title: "Scarpe & Accessori" }
];

export const MOCK_CUSTOMERS = [];
