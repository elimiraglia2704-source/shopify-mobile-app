import Link from 'next/link';
import { Home, ShoppingBag, Camera, ShoppingCart, User } from 'lucide-react';
import React from 'react';

// Bottom navigation bar with five macro areas: Home, Shop, Studio, Cart, Profile
export default function BottomNav() {
  const tabStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    height: '100%',
    position: 'relative',
    transition: 'color 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'
  };

  const iconStyle: React.CSSProperties = {
    transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), filter 0.4s cubic-bezier(0.175,0.885,0.32,1.275), color 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    opacity: 0,
    transform: 'translateY(10px)',
    position: 'absolute',
    bottom: '10px',
    transition: 'opacity 0.4s cubic-bezier(0.175,0.885,0.32,1.275), transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'
  };

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
      <Link href="/" style={tabStyle}>
        <Home size={22} style={iconStyle} />
        <span style={labelStyle}>Home</span>
      </Link>

      <Link href="/shop" style={tabStyle}>
        <ShoppingBag size={22} style={iconStyle} />
        <span style={labelStyle}>Shop</span>
      </Link>

      <Link href="/studio" style={tabStyle}>
        <Camera size={22} style={iconStyle} />
        <span style={labelStyle}>Studio</span>
      </Link>

      <Link href="/cart" style={tabStyle}>
        <ShoppingCart size={22} style={iconStyle} />
        <span style={labelStyle}>Cart</span>
      </Link>

      <Link href="/profile" style={tabStyle}>
        <User size={22} style={iconStyle} />
        <span style={labelStyle}>Profile</span>
      </Link>
    </nav>
  );
}
