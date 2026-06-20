import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../catalog/domain/models/product.dart';
import '../../../core/storage/storage_service.dart';

class ProductScreen extends ConsumerWidget {
  final Product product;
  const ProductScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storage = ref.watch(storageServiceProvider);
    final isWished = storage.isInWishlist(product.id);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(
              isWished ? Icons.favorite : Icons.favorite_border,
              color: isWished ? Colors.red : Colors.white,
            ),
            onPressed: () {
              storage.toggleWishlist(product.id);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Immagine Hero
            Hero(
              tag: 'product_img_${product.id}',
              child: SizedBox(
                height: 500,
                width: double.infinity,
                child: CachedNetworkImage(
                  imageUrl: product.imageUrl,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ELISEE',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.title,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '${product.price.toStringAsFixed(2)} ${product.currency}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    product.description.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ''),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      height: 1.5,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: ElevatedButton(
            onPressed: product.availableForSale
                ? () {
                    // TODO: Aggiungi al carrello
                  }
                : null,
            child: Text(product.availableForSale ? 'Aggiungi al carrello' : 'Esaurito'),
          ),
        ),
      ),
    );
  }
}
