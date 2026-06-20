import Link from 'next/link';
import { Search, Bell, ShoppingBag } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-xl tracking-tight">ELISEE</Link>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-white transition">
          <Search size={20} />
        </button>
        <button className="text-gray-300 hover:text-white transition relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link href="/cart" className="text-gray-300 hover:text-white transition relative">
          <ShoppingBag size={20} />
          <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            0
          </span>
        </Link>
      </div>
    </header>
  );
}
