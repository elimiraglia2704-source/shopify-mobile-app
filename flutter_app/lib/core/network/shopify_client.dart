import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final shopifyClientProvider = Provider<ShopifyClient>((ref) {
  return ShopifyClient();
});

class ShopifyClient {
  late final Dio _dio;

  final String _shopDomain = 'eliseebrand.myshopify.com';
  final String _accessToken = 'fd3d51862812c1f0c530dc83ac3f6685';
  final String _apiVersion = '2024-04';

  ShopifyClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://$_shopDomain/api/$_apiVersion/graphql.json',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': _accessToken,
      },
    ));
    
    // Interceptor per logging e gestione errori
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // print('➡️ Request to ${options.uri}');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        // Shopify GraphQL restituisce 200 anche per query error, va parsato.
        if (response.data != null && response.data['errors'] != null) {
          // print('⚠️ GraphQL Errors: ${response.data['errors']}');
        }
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        // print('❌ Network Error: ${e.message}');
        return handler.next(e);
      },
    ));
  }

  /// Metodo generico per query
  Future<Map<String, dynamic>> query(String query, {Map<String, dynamic>? variables}) async {
    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': variables ?? {},
      });

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors'][0]['message']}');
        }
        return data['data'];
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  // Aggiungeremo qui metodi specifici come getProducts(), getProductDetails(), ecc.
}
