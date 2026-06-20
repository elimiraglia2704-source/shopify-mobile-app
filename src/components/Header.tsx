'use client';

import Link from 'next/link';
import { Search, Bell, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  if (pathname === '/cart') {
    return null;
  }

  return (
    <header className="header">
      <button className="icon-btn">
        <Search />
      </button>
      
      <Link href="/" className="header-logo-btn">
        <img src="/logo-total-white.png" className="header-logo-img" alt="Elisee" />
      </Link>
      
      <Link href="/cart" className="icon-btn cart-icon-btn">
        <ShoppingBag />
        <span className="cart-badge visible">0</span>
      </Link>
    </header>
  );
}
