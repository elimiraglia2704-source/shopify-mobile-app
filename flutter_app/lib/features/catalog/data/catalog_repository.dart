import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/shopify_client.dart';
import '../domain/models/product.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final client = ref.watch(shopifyClientProvider);
  return CatalogRepository(client);
});

final catalogProductsProvider = FutureProvider<List<Product>>((ref) async {
  final repo = ref.watch(catalogRepositoryProvider);
  return repo.fetchProducts();
});

class CatalogRepository {
  final ShopifyClient _client;
  CatalogRepository(this._client);

  Future<List<Product>> fetchProducts({int limit = 20, String? query}) async {
    final graphql = '''
      query getProducts(\$first: Int!, \$query: String) {
        products(first: \$first, query: \$query) {
          edges {
            node {
              id
              title
              description
              availableForSale
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              images(first: 4) {
                edges { node { url } }
              }
            }
          }
        }
      }
    ''';

    final data = await _client.query(graphql, variables: {
      'first': limit,
      'query': query ?? '',
    });

    final edges = data['products']['edges'] as List;
    return edges.map((e) => Product.fromShopifyNode(e['node'])).toList();
  }
}
