import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inizializzazione storage locale
  await Hive.initFlutter();
  await Hive.openBox('settings');
  await Hive.openBox('wishlist');

  runApp(
    const ProviderScope(
      child: EliseeApp(),
    ),
  );
}

class EliseeApp extends ConsumerWidget {
  const EliseeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return ScreenUtilInit(
      designSize: const Size(390, 844), // iPhone 13/14 come reference
      minTextAdapt: true,
      builder: (context, child) {
        return MaterialApp.router(
          title: 'Elisee',
          themeMode: ThemeMode.dark, // L'app è premium dark by default
          darkTheme: AppTheme.darkTheme,
          routerConfig: router,
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }
}
