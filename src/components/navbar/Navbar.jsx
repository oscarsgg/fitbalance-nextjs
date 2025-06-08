'use client';
import React from 'react';
import Link from 'next/link'; // Necesario si usas Next.js

export const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full pt-4 pb-4 z-20 bg-[#b2e29f] backdrop-blur-sm text-gray-700 rounded-b-xl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <img 
              src="/logo1.png" 
              alt="FitBalance Logo" 
              className="h-12 w-auto mr-3 rounded-full border-2 border-green-800/60" 
            />
            <h1 className="text-xl sm:text-2xl font-bold">FitBalance</h1>
          </div>

          {/* Links */}
          <div className="space-x-4">
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-white hover:bg-green-600/70 rounded-md transition">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 text-sm font-medium bg-green-700/60 text-white hover:bg-green-700/80 rounded-md transition">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
