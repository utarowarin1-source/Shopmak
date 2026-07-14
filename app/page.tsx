'use client';

import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Link from 'next/link';

export default function LandingPage() {
  const { products, categories } = useApp(); // ดึงหมวดหมู่จากระบบจริง
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-800 pb-12">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
            <span className="bg-white text-orange-600 p-1.5 rounded-xl shadow-inner text-lg">🛍️</span>
            SHOPMAK
          </Link>

          <div className="w-full sm:max-w-xl relative">
            <input
              type="text"
              placeholder="ค้นหาสินค้า ดีลเด็ด รีวิว..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 rounded-full text-gray-800 text-sm border-none shadow focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-400"
            />
          </div>

          <Link href="/admin" className="text-xs bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-1">
            ⚙️ ระบบหลังบ้าน
          </Link>
        </div>
      </header>

      {/* Dynamic Categories */}
      <div className="max-w-6xl mx-auto px-4 mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {searchQuery ? `ผลการค้นหาสำหรับ "${searchQuery}"` : '🔥 สินค้าแนะนำดีลเด็ด'}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400">ไม่พบสินค้าในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="aspect-square w-full rounded-xl mb-3 bg-gray-50 overflow-hidden relative">
                    <img src={product.image} alt={product.title} className="object-cover w-full h-full" />
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {product.category.name}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[32px]">
                    {product.title}
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="text-base font-black text-orange-500 mb-3">฿{product.price}</div>
                  <div className="flex flex-col gap-1.5">
                    {product.shopeeUrl && (
                      <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" className="bg-[#EE4D2D] text-white text-center font-bold py-1.5 rounded-xl text-[11px] block text-center">
                        ซื้อที่ Shopee
                      </a>
                    )}
                    {product.lazadaUrl && (
                      <a href={product.lazadaUrl} target="_blank" rel="noopener noreferrer" className="bg-[#101566] text-white text-center font-bold py-1.5 rounded-xl text-[11px] block text-center">
                        ซื้อที่ Lazada
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}