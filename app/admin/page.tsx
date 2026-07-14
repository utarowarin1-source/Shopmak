'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '../context/AppContext'; // Import Product interface
import { useApp } from '../context/AppContext';
import Link from 'next/link';

export default function AdminPage() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    isAdminLoggedIn, loginAdmin, logoutAdmin 
  } = useApp();
  
  // State สำหรับจัดการ Login
  const [passwordInput, setPasswordInput] = useState('');
  
  // State สำหรับจัดการฟอร์มสินค้า (ทั้งเพิ่มและแก้ไข)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [shopeeUrl, setShopeeUrl] = useState('');
  const [lazadaUrl, setLazadaUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // ✨ ค่าตั้งค่าเพิ่มเติมสำหรับการตลาด
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // State สำหรับดึงข้อมูล (เดี่ยวและกลุ่ม)
  const [isFetching, setIsFetching] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [isBulkFetching, setIsBulkFetching] = useState(false);
  const [bulkLogs, setBulkLogs] = useState<string[]>([]);

  // State สำหรับจัดการหมวดหมู่
  const [newCategoryName, setNewCategoryName] = useState('');

  // 🔍 State สำหรับการค้นหา กรอง และจัดเรียง
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc

  // 📢 ตั้งค่าประกาศหน้าร้าน (Shop Settings)
  const [shopAnnouncement, setShopAnnouncement] = useState('🎉 ต้อนรับโปรโมชันประจำเดือน! แจกพิกัดโค้ดส่วนลด Shopee & Lazada ด้านล่างนี้เลย!');

  // 🔐 เข้าสู่ระบบหลังบ้าน
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passwordInput);
    if (!success) alert('รหัสผ่านไม่ถูกต้อง!');
  };

  // ⚡ ฟังก์ชันดึงข้อมูลสินค้าเดี่ยวอัตโนมัติ
  const handleAutoFetch = async (targetUrl: string) => {
    if (!targetUrl) return alert('กรุณาวางลิงก์สินค้าก่อนกดดึงข้อมูลครับ');
    setIsFetching(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      
      // If a title is found, populate the form, even if price or image are missing
      if (data.title) {
        setTitle(data.title); // data.title is guaranteed to be a string here
        setImage(data.image || ''); // Use fallback image if not scraped
        if (data.price && data.price > 0) {
          setPrice(data.price.toString());
        } else {
          setPrice(''); // Clear price if not found or invalid
        }
        alert('✨ ดึงรูป ชื่อ และราคา เรียบร้อยแล้ว!');
      } else {
        alert('ไม่สามารถดึงข้อมูลอัตโนมัติได้ กรุณากรอกข้อมูลด้วยตัวเองครับ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsFetching(false);
    }
  };

  // 🚀 ฟังก์ชันดึงข้อมูลสินค้าพร้อมกันจำนวนมาก (Bulk Import)
  const handleBulkImport = async () => {
    const urls = bulkUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    if (urls.length === 0) return alert('กรุณาใส่ลิงก์สินค้าอย่างน้อย 1 ลิงก์ (1 บรรทัดต่อ 1 ลิงก์)');

    setIsBulkFetching(true);
    setBulkLogs([]);
    const importedProducts = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setBulkLogs(prev => [...prev, `[${i + 1}/${urls.length}] กำลังดึง: ${url.substring(0, 30)}...`]);

      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();

        if (data.success) {
          const isShopee = url.includes('shopee') || url.includes('shope.ee');
          importedProducts.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: data.title || 'สินค้าดึงอัตโนมัติ',
            price: Number(data.price) || 0,
            image: data.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500',
            shopeeUrl: isShopee ? url : '',
            lazadaUrl: !isShopee ? url : '',
            category: { id: selectedCategory || (categories[0] || 'ทั่วไป'), name: selectedCategory || (categories[0] || 'ทั่วไป') },
            isFeatured: false,
            isBestSeller: false
          });
          setBulkLogs(prev => [...prev, `✅ สำเร็จ: ${data.title?.substring(0, 20)}...`]);
        } else {
          setBulkLogs(prev => [...prev, `❌ ล้มเหลว (ข้ามรายการนี้)`]);
        }
      } catch {
        setBulkLogs(prev => [...prev, `❌ เออร์เรอร์ระบบ`]);
      }
      await new Promise(r => setTimeout(r, 1000)); // Delay กันโดนบล็อก
    }

    if (importedProducts.length > 0) {
      setProducts([...importedProducts, ...products]);
      setBulkUrls('');
      alert(`🎉 นำเข้าสำเร็จทั้งหมด ${importedProducts.length} รายการ!`);
    }
    setIsBulkFetching(false);
  };

  // 💾 ฟังก์ชันบันทึกข้อมูล (รองรับทั้งเพิ่มใหม่ และ อัปเดตของเดิม)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return alert('กรุณาระบุชื่อและราคาสินค้า');

    if (editingId) {
      // ✏️ โหมดแก้ไขสินค้าเดิม
      const updated = products.map(p => p.id === editingId ? {
        ...p, title, price: Number(price), image, shopeeUrl, lazadaUrl,
        category: { id: selectedCategory || 'ทั่วไป', name: selectedCategory || 'ทั่วไป' }, isFeatured, isBestSeller
      } : p);
      setProducts(updated);
      setEditingId(null);
      alert('📝 อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว!');
    } else {
      // ➕ โหมดเพิ่มสินค้าใหม่
      const newProduct = {
        id: Date.now().toString(),
        title, price: Number(price),
        image: image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500',
        shopeeUrl, lazadaUrl, category: { id: selectedCategory || 'ทั่วไป', name: selectedCategory || 'ทั่วไป' },
        isFeatured, isBestSeller
      };
      setProducts([newProduct, ...products]);
      alert('💾 บันทึกสินค้าใหม่สำเร็จ!');
    }

    // ล้างข้อมูลฟอร์ม
    setTitle(''); setPrice(''); setImage(''); setShopeeUrl(''); setLazadaUrl('');
    setIsFeatured(false); setIsBestSeller(false);
  };

  // ✏️ ฟังก์ชันดึงข้อมูลสินค้าเก่าขึ้นมาเตรียมแก้ไข
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setImage(product.image);
    setShopeeUrl(product.shopeeUrl || '');
    setLazadaUrl(product.lazadaUrl || '');
    setSelectedCategory(product.category.name || '');
    setIsFeatured(product.isFeatured || false);
    setIsBestSeller(product.isBestSeller || false);
    
    // เลื่อนหน้าจอขึ้นไปที่ฟอร์มแก้ไขอัตโนมัติเพื่อความสะดวก
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🗑️ ลบสินค้า
  const handleDeleteProduct = (id: string) => {
    if (confirm('ยืนยันที่จะลบสินค้าชิ้นนี้อย่างถาวร?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // 🏷️ จัดการหมวดหมู่
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return alert('มีหมวดหมู่นี้อยู่แล้ว');
    setCategories([...categories, trimmed]);
    setNewCategoryName('');
  };

  // 📊 คำนวณสถิติภาพรวมร้านค้า (Dashboard Overview Widgets)
  const stats = useMemo(() => {
    return {
      total: products.length,
      shopee: products.filter(p => p.shopeeUrl).length,
      lazada: products.filter(p => p.lazadaUrl).length,
      categoriesCount: categories.length
    };
  }, [products, categories]);

  // 🔍 ค้นหา กรอง และ จัดเรียงข้อมูลสินค้าตามเงื่อนไข
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()); // No change needed here
      const matchCat = filterCategory ? p.category.name === filterCategory : true; // Access .name property
      return matchSearch && matchCat;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => Number(b.id.split('-')[0]) - Number(a.id.split('-')[0])); // เรียงตามชิ้นล่าสุด

    return result;
  }, [products, searchQuery, filterCategory, sortBy]);

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
          <span className="text-4xl">🔒</span>
          <h2 className="text-xl font-extrabold text-gray-900 mt-3 mb-1">แผงควบคุมผู้ดูแลระบบ</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
            <input type="password" placeholder="รหัสผ่านผู้ดูแลระบบ" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-center" />
            <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl text-sm shadow">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 pb-16">
      {/* ส่วนหัว */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition">← หน้าหลักร้านค้า</Link>
          <h1 className="text-sm font-black text-gray-900 border-l pl-3 border-gray-300">ADMIN CONTROL SUITE 🛠️</h1>
        </div>
        <button onClick={logoutAdmin} className="text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition">🚪 ออกจากระบบ</button>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* 📊 1. แผงควบคุมสถิติร้านค้าภาพรวม (Dashboard Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-2xl bg-orange-50 p-2 rounded-xl">📦</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">สินค้าทั้งหมด</p>
              <h3 className="text-lg font-black text-gray-900">{stats.total} ชิ้น</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-2xl bg-orange-100 p-2 rounded-xl">🟠</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ลิงก์ Shopee</p>
              <h3 className="text-lg font-black text-orange-600">{stats.shopee} รายการ</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-2xl bg-blue-100 p-2 rounded-xl">🔵</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ลิงก์ Lazada</p>
              <h3 className="text-lg font-black text-blue-600">{stats.lazada} รายการ</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-2xl bg-gray-100 p-2 rounded-xl">📂</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่ระบบ</p>
              <h3 className="text-lg font-black text-gray-800">{stats.categoriesCount} หมวด</h3>
            </div>
          </div>
        </div>

        {/* ส่วนเนื้อหาหลัก */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* คอลัมน์ซ้าย (5 ส่วน): ฟอร์มจัดการตั้งค่าต่างๆ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 📝 ฟอร์ม เพิ่ม/แก้ไข สินค้า (ฉลาดขึ้น มีสวิตช์ป้ายสถานะ) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  {editingId ? '✏️ กำลังแก้ไขข้อมูลสินค้า' : '📦 เพิ่มสินค้าใหม่ลงระบบ'}
                </h2>
                {editingId && (
                  <button type="button" onClick={() => {
                    setEditingId(null); setTitle(''); setPrice(''); setImage(''); setShopeeUrl(''); setLazadaUrl('');
                  }} className="text-[10px] font-bold text-red-500 hover:underline">ยกเลิกแก้ไข</button>
                )}
              </div>

              {/* กล่องดึงข้อมูลเดี่ยว */}
              {!editingId && (
                <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100 flex gap-2">
                  <input type="text" placeholder="วางลิงก์ดึงด่วนชิ้นเดียว..." value={shopeeUrl || lazadaUrl} onChange={(e) => e.target.value.includes('lazada') ? setLazadaUrl(e.target.value) : setShopeeUrl(e.target.value)} className="flex-1 text-xs p-2 border border-gray-200 rounded-lg bg-white" />
                  <button type="button" onClick={() => handleAutoFetch(shopeeUrl || lazadaUrl)} disabled={isFetching} className="bg-blue-600 text-white font-bold px-3 text-[10px] rounded-lg disabled:opacity-50">{isFetching ? '⏳...' : 'ดึงด่วน'}</button>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ชื่อสินค้า *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full text-xs p-2.5 border border-gray-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">ราคา (บาท) *</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full text-xs p-2.5 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">หมวดหมู่ *</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white">
                      <option value="">-- เลือกหมวดหมู่ --</option>
                      {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                {/* 🎯 การตั้งค่าการตลาดและติดป้าย (Marketing Features) */}
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 my-1">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-orange-500 focus:ring-0" />
                    🌟 สินค้าแนะนำ
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="rounded text-orange-500 focus:ring-0" />
                    🔥 สินค้าขายดี
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">รูปภาพสินค้า (URL)</label>
                  <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="w-full text-xs p-2.5 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ลิงก์ Affiliate Shopee</label>
                  <input type="text" value={shopeeUrl} onChange={(e) => setShopeeUrl(e.target.value)} className="w-full text-xs p-2.5 border border-gray-200 rounded-lg" placeholder="https://shope.ee/..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ลิงก์ Affiliate Lazada</label>
                  <input type="text" value={lazadaUrl} onChange={(e) => setLazadaUrl(e.target.value)} className="w-full text-xs p-2.5 border border-gray-200 rounded-lg" placeholder="https://s.lazada.co.th/..." />
                </div>

                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs shadow transition mt-2">
                  {editingId ? '💾 อัปเดตข้อมูลการแก้ไขสินค้า' : '💾 บันทึกสินค้าใหม่ลงระบบ'}
                </button>
              </form>
            </div>

            {/* ⚡ ระบบดึงสินค้าจำนวนมาก (Bulk Import) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">⚡ ดึงข้อมูลพร้อมกันจำนวนมาก (Bulk)</h2>
              <p className="text-[9px] text-gray-400 mb-3">วางลิงก์บรรทัดละ 1 รายการ แล้วระบบจะทำการประมวลผลเซฟเก็บเข้าหมวดหมู่ที่เลือกให้อัตโนมัติ</p>
              <textarea rows={3} value={bulkUrls} onChange={(e) => setBulkUrls(e.target.value)} placeholder="วางลิงก์ Shopee / Lazada หลายๆ ลิงก์ที่นี่..." className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono mb-2" />
              <button type="button" onClick={handleBulkImport} disabled={isBulkFetching} className="w-full bg-gray-900 text-white font-bold py-2 rounded-xl text-xs disabled:opacity-50">
                {isBulkFetching ? '⏳ ระบบกำลังประมวลผลดึงออโต้...' : '🚀 เริ่มดึงข้อมูลทั้งหมด'}
              </button>
              {bulkLogs.length > 0 && (
                <div className="bg-gray-900 text-green-400 text-[9px] p-2.5 rounded-xl font-mono max-h-24 overflow-y-auto mt-2">{bulkLogs.map((l, i) => <div key={i}>{l}</div>)}</div>
              )}
            </div>

            {/* 📢 ตั้งค่าข้อความประกาศหน้าร้าน */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold text-gray-900 mb-2">📢 จัดการข้อความประกาศหน้าร้านค้า</h2>
              <input type="text" value={shopAnnouncement} onChange={(e) => setShopAnnouncement(e.target.value)} className="w-full text-xs p-2.5 border border-gray-200 rounded-xl mb-2" />
              <button onClick={() => alert('บันทึกประกาศเรียบร้อยแล้ว')} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs transition">บันทึกประกาศ</button>
            </div>

          </div>

          {/* คอลัมน์ขวา (7 ส่วน): ตารางแสดงผล ค้นหา กรอง จัดเรียง และปุ่มจัดการด่วน */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
            
            {/* หัวตารางและแถบตัวกรอง/จัดเรียงแบบมืออาชีพ */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">📦 รายการคลังสินค้าภายในระบบทั้งหมด</h2>
              
              {/* แผงควบคุม ค้นหา + กรองหมวดหมู่ + จัดเรียงระดับโปร */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                <input type="text" placeholder="🔍 ค้นชื่อสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-xs p-2 border border-gray-200 rounded-xl" />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-xs p-2 border border-gray-200 rounded-xl bg-white">
                  <option value="">📂 ทุกหมวดหมู่สินค้า</option>
                  {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs p-2 border border-gray-200 rounded-xl bg-white">
                  <option value="newest">⏱️ เรียงจากล่าสุด</option>
                  <option value="price-asc">📈 ราคา: ต่ำไปสูง</option>
                  <option value="price-desc">📉 ราคา: สูงไปต่ำ</option>
                </select>
              </div>
            </div>

            {/* รายการแสดงผลการจัดการสินค้า */}
            <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-1">
              {processedProducts.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl border-gray-200 text-xs text-gray-400">ไม่พบข้อมูลสินค้าที่ต้องการกรอง</div>
              ) : (
                processedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border border-gray-100 p-3 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={product.image} alt="" className="w-12 h-12 object-cover rounded-lg border flex-shrink-0 bg-white" onError={(e) => (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500'} />
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-gray-800 truncate">{product.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-orange-500 font-bold text-xs">฿{product.price}</span> 
                          <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{product.category.name || 'ทั่วไป'}</span>
                          {product.isFeatured && <span className="text-[9px] bg-yellow-100 text-yellow-700 font-bold px-1.5 rounded">🌟 แนะนำ</span>}
                          {product.isBestSeller && <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 rounded">🔥 ขายดี</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* ปุ่มแอ็กชันควบคุมการย้าย-ลบ-แก้ไข */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button onClick={() => startEdit(product)} className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-blue-200 transition">แก้ไข</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-[11px] font-bold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition">ลบ</button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}