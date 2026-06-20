import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../catalog/data/catalog_repository.dart';
import '../../../shared/widgets/product_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ELISEE', style: TextStyle(letterSpacing: 4)),
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            // TODO: Aprire drawer o navigare a profilo
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () {
              // TODO: Navigare al carrello
            },
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Buongiorno,',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  Text(
                    'Esplora la collezione',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      fontSize: 28,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Rendering dei Prodotti tramite Provider
          ref.watch(catalogProductsProvider).when(
            data: (products) {
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.65,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final product = products[index];
                      return ProductCard(product: product);
                    },
                    childCount: products.length,
                  ),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (err, stack) => SliverFillRemaining(
              child: Center(
                child: Text(
                  'Errore caricamento catalogo',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.red),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.push('/assistant');
        },
        backgroundColor: Theme.of(context).colorScheme.primary,
        child: const Icon(Icons.auto_awesome, color: Colors.black),
      ),
    );
  }
}
