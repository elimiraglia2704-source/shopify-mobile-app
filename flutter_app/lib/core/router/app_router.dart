import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Screens verranno creati in seguito
import '../../features/home/presentation/home_screen.dart';
import '../../features/assistant/presentation/assistant_screen.dart';
import '../../features/product/presentation/product_screen.dart';
import '../../features/catalog/domain/models/product.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/assistant',
        builder: (context, state) => const AssistantScreen(),
      ),
      GoRoute(
        path: '/product',
        builder: (context, state) {
          final product = state.extra as Product;
          return ProductScreen(product: product);
        },
      ),
      // Aggiungeremo altre route qui: /cart
    ],
  );
});
