class Product {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final List<String> images;
  final double price;
  final String currency;
  final bool availableForSale;

  Product({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.images,
    required this.price,
    required this.currency,
    required this.availableForSale,
  });

  factory Product.fromShopifyNode(Map<String, dynamic> node) {
    final imagesEdges = node['images']?['edges'] as List? ?? [];
    final images = imagesEdges
        .map((e) => e['node']['url'] as String)
        .toList();

    return Product(
      id: node['id'] ?? '',
      title: node['title'] ?? '',
      description: node['description'] ?? '',
      imageUrl: images.isNotEmpty ? images.first : '',
      images: images,
      price: double.tryParse(node['priceRange']?['minVariantPrice']?['amount'] ?? '0') ?? 0.0,
      currency: node['priceRange']?['minVariantPrice']?['currencyCode'] ?? 'EUR',
      availableForSale: node['availableForSale'] ?? false,
    );
  }
}
