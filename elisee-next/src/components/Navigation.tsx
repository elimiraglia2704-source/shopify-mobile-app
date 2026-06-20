'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tag, Video, ShoppingCart, User } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Tag, label: 'Esplora', href: '/explore' },
    { icon: Video, label: 'Studio', href: '/studio' },
    { icon: ShoppingCart, label: 'Carrello', href: '/cart' },
    { icon: User, label: 'Profilo', href: '/profile' }
  ];

  return (
    <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              prefetch={true}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}
