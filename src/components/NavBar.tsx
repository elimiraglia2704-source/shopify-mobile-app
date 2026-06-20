// src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { Home, Store, Settings, ShoppingCart, User } from "lucide-react";

export default function NavBar() {
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Store },
    { href: "/studio", label: "Studio", icon: Settings },
    { href: "/cart", label: "Carrello", icon: ShoppingCart },
    { href: "/profile", label: "Profilo", icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-tab"
        >
          <item.icon />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
