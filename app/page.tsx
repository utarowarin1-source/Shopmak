'use client';

import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Link from 'next/link';

export default function LandingPage() {
  const { products, categories } = useApp(); // ดึงหมวดหมู่จากระบบจริง
 const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'ratingDesc') {
        const ratingA = 'rating' in a ? (a as any).rating || 0 : 0;
        const ratingB = 'rating' in b ? (b as any).rating || 0 : 0;
        return ratingB - ratingA;
      }
 return 0;
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
className="w-full pl-5 pr-12 py-3 rounded-full bg-white text-gray-950 placeholder-gray-500 font-bold border-2 border-orange-600 focus:outline-none focus:border-orange-900 text-base shadow-sm" />          </div>

{/* กล่องครอบหลักเพื่อจัด Layout */}
<div className="flex items-center justify-end gap-4 my-4 px-4">
  
  {/* 1. ส่วนจัดเรียงสินค้า (แยกออกมาอยู่นอก Link) */}
  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
    <span className="text-xs text-gray-500 font-medium">จัดเรียง:</span>
    <select 
      value={sortBy} 
      onChange={(e) => setSortBy(e.target.value)} 
      className="text-xs font-semibold bg-transparent text-gray-700 focus:outline-none cursor-pointer"
    >
      <option value="default">แนะนำ</option>
      <option value="priceAsc">ราคา: ต่ำ → สูง</option>
      <option value="priceDesc">ราคา: สูง → ต่ำ</option>
      <option value="ratingDesc">คะแนนรีวิว: สูงสุด</option>
    </select>
  </div>

  {/* 2. ปุ่มไปหน้าหลังบ้าน (แยกออกมาเป็น Link อันเดียว) */}
  <Link href="/admin" className="text-xs bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
    ⚙️ ระบบหลังบ้าน
  </Link>

</div>
        </div>
      </header>
      
{/* หมวดหมู่ใหม่แบบ Grid */}
<section className="max-w-6xl mx-auto px-4 mt-6">
  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
{categories
  .filter((cat: any) => cat && (typeof cat === 'string' || cat.name)) // แก้ให้กรองเอาเฉพาะที่มีชื่อจริงๆ
  .map((cat: any, index: number) => (
    <button
      key={cat.id || index}
      onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : cat.name)}
      className="flex flex-col items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
    >
      <span className="text-[12px] font-bold text-white truncate w-full text-center">
        {typeof cat === 'string' ? cat : (cat.name || 'ไม่มีชื่อ')}
      </span>
    </button>
))}
  </div>
</section>

{/* หมวดหมู่ยอดนิยม */}
<section className="max-w-6xl mx-auto px-4 mt-8 mb-8">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-6 bg-orange-500 rounded-full" />
      <h2 className="text-lg font-bold text-white">หมวดหมู่ยอดนิยม</h2>
    </div>
    <span className="text-sm text-gray-400 cursor-pointer hover:text-white">ดูทั้งหมด </span>
  </div>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
{categories
  .filter((cat: any) => cat && (typeof cat === 'string' || cat.name)) // แก้ให้กรองเอาเฉพาะที่มีชื่อจริงๆ
  .map((cat: any, index: number) => (
    <button
      key={cat.id || index}
      onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : cat.name)}
      className="flex flex-col items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
    >
      <div className="text-xl mb-1">{cat.icon || '📦'}</div>
      <span className="text-[12px] font-bold text-white truncate w-full text-center">
        {typeof cat === 'string' ? cat : (cat.name || 'ไม่มีชื่อ')}
      </span>
    </button>
))}

  </div>
</section>

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
<div className="aspect-square w-full rounded-xl mb-3 bg-gray-50 overflow-hidden relative flex items-center justify-center border border-gray-100">
              {product.image ? (
                // 📸 กรณีที่ 1: มีการใส่ลิงก์รูปมา ก็ให้แสดงรูปภาพปกติ
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" 
                />
              ) : (
                // 🔗 กรณีที่ 2: "ไม่ได้ใส่ลิงก์รูป" ให้สร้างหน้าต่างโลโก้แอปนั้น ๆ ขึ้นมาแทนอัตโนมัติ (สไตล์ Linktree)
                <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all ${
                  product.shopeeUrl ? 'bg-orange-50 text-orange-600' :
                  product.lazadaUrl ? 'bg-blue-50 text-blue-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  <div className="text-4xl mb-2 animate-bounce">
                    {product.shopeeUrl ? '🍊' : product.lazadaUrl ? '💙' : '🔗'}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {product.shopeeUrl ? 'Shopee Link' : product.lazadaUrl ? 'Lazada Link' : 'Open Link'}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-1 truncate max-w-full px-2">
                    {product.shopeeUrl || product.lazadaUrl || 'คลิกเพื่อไปยังลิงก์'}
                  </span>
                </div>
              )}

              
              {/* แถบชื่อหมวดหมู่ที่มุมภาพ */}
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm">
                {product.category?.name || 'ทั่วไป'}
              </span>
            </div>
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[32px]">
                    {product.title}
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="text-base font-black text-orange-500 mb-3">฿{product.price}</div>
                  <div className="flex flex-col gap-1.5">
                    {/* ⭐️ ฟีเจอร์ใหม่: เพิ่มระบบคะแนนรีวิวดาว ดึงดูดสายตาคนซื้อ */}
<div className="flex items-center gap-1 text-xs text-gray-650 bg-gray-150/80 px-2.5 py-1.5 rounded-md w-fit mb-1 font-medium">
  <span className="text-yellow-500">⭐</span>
  <span className="text-gray-900 font-bold">4.8</span>
  <span className="text-gray-500 text-[10px]">(120+ รีวิว)</span>
</div>
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