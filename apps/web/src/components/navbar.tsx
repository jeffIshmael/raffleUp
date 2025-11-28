import React from 'react';
import Link from 'next/link';
import NavbarClient from './NavbarClient';
import NavbarMobileClient from './NavbarMobileClient';
import MobileNav from './MobileNav';

export default function Navbar() {
  return (
    <>
      {/* DESKTOP NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 hidden md:block 
        bg-black bg-opacity-90 backdrop-blur-md 
        border-b border-amber-400 border-opacity-20"
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wider">
            <span className="text-white">RAFFLE</span>
            <span className="text-amber-400 ml-2">UP</span>
          </Link>

          {/* Client Component for Dynamic Content */}
          <NavbarClient />
        </div>
      </nav>

      {/* MOBILE NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 md:hidden 
        bg-black bg-opacity-90 backdrop-blur-md 
        border-b border-amber-400 border-opacity-20 px-4 py-3
        flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wider">
          <span className="text-white">RAFFLE</span>
          <span className="text-amber-400 ml-1">UP</span>
        </Link>

        {/* Mobile Client Component */}
        <NavbarMobileClient />
      </nav>

      {/* Bottom Mobile Nav */}
      <MobileNav />
    </>
  );
}