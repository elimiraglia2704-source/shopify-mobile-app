import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  final Box _settingsBox = Hive.box('settings');
  final Box _wishlistBox = Hive.box('wishlist');

  // Gestione Profilo
  Future<void> saveProfile(Map<String, dynamic> profile) async {
    await _settingsBox.put('userProfile', profile);
  }

  Map<String, dynamic>? getProfile() {
    final data = _settingsBox.get('userProfile');
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    return null;
  }

  // Gestione Auth State (Area Direzione/SPID)
  Future<void> setAuthToken(String token) async {
    await _settingsBox.put('authToken', token);
  }

  String? getAuthToken() {
    return _settingsBox.get('authToken');
  }

  // Gestione Wishlist
  Future<void> toggleWishlist(String productId) async {
    final List<String> current = getWishlist();
    if (current.contains(productId)) {
      current.remove(productId);
    } else {
      current.add(productId);
    }
    await _wishlistBox.put('ids', current);
  }

  List<String> getWishlist() {
    final data = _wishlistBox.get('ids', defaultValue: <String>[]);
    return List<String>.from(data);
  }

  bool isInWishlist(String productId) {
    return getWishlist().contains(productId);
  }
}
