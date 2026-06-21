'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import React from 'react';

// Bottom navigation bar with five macro areas: Home, Shop, Studio, Cart, Profile
export default function BottomNav() {
  const pathname = usePathname();

  const getClassName = (path: string) => {
    if (path === '/' && pathname === '/') return 'nav-tab active';
    if (path !== '/' && pathname.startsWith(path)) return 'nav-tab active';
    return 'nav-tab';
  };

  const isStudioActive = pathname.startsWith('/studio');

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'absolute',
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '380px',
        height: '68px',
        background: 'rgba(8, 5, 12, 0.7)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '34px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 100,
        boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(255,255,255,0.02)'
      }}
    >
      <Link href="/" className={getClassName('/')}>
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link href="/shop" className={getClassName('/shop')}>
        <ShoppingBag size={22} />
        <span>Shop</span>
      </Link>

      <Link href="/studio" className={getClassName('/studio')}>
        <img 
          src="/logo-total-white.png" 
          alt="Studio" 
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isStudioActive ? 'translateY(-12px)' : 'none',
            filter: isStudioActive ? 'opacity(1) drop-shadow(0 4px 12px rgba(155,89,208,0.8))' : 'opacity(0.7)'
          }}
        />
        <span>Studio</span>
      </Link>

      <Link href="/cart" className={getClassName('/cart')}>
        <ShoppingCart size={22} />
        <span>Cart</span>
      </Link>

      <Link href="/profile" className={getClassName('/profile')}>
        <User size={22} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
