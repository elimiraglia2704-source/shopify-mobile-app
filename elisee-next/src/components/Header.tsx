import Link from 'next/link';
import { Search, Bell, ShoppingBag } from 'lucide-react';

import Image from 'next/image';

export default function Header() {
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
