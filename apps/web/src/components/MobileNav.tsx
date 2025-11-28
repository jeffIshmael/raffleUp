'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname?.startsWith('/raffle/')) {
    return null;
  }

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/winners', icon: '🏆', label: 'Past draws' },
    { path: '/#', icon: '🎟️',	label: 'My Tickets' },
    { path: '/profile', icon: '📜',	label: 'History' },
  ];
  

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black bg-opacity-95
      backdrop-blur-md border-t-2 border-amber-400 border-opacity-40"
    >
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg
              transition-all duration-300
              ${
                isActive(item.path)
                  ? 'text-amber-400 bg-amber-400 bg-opacity-10 border border-amber-400'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}