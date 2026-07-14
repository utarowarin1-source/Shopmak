'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  shopeeUrl: string;
  lazadaUrl: string;
  category: { id: string; name: string };
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['ทั้งหมด', 'Gadgets', 'ของใช้ในบ้าน']);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // 1. โหลดข้อมูลเริ่มต้นจาก LocalStorage เมื่อเปิดเว็บครั้งแรก
  useEffect(() => {
    const savedProducts = localStorage.getItem('shopmak_products');
    const savedCategories = localStorage.getItem('shopmak_categories');
    const savedLoginStatus = localStorage.getItem('shopmak_admin_login');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // ข้อมูลตัวอย่างเริ่มต้นถ้ายังไม่มีข้อมูลในเครื่อง
      const defaultProducts = [
        {
          id: '1',
          title: 'Aolon Tetra R4 สมาร์ทวอทช์สุดคุ้ม ฟังก์ชันครบ จอสวยคมชัด',
          price: 399,
          image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=500&auto=format&fit=crop',
          shopeeUrl: 'https://shopee.co.th',
          lazadaUrl: 'https://lazada.co.th',
          category: { id: "gadgets", name: "Gadgets" }
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('shopmak_products', JSON.stringify(defaultProducts));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      localStorage.setItem('shopmak_categories', JSON.stringify(['ทั้งหมด', 'Gadgets', 'ของใช้ในบ้าน']));
    }

    if (savedLoginStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // 2. เซฟข้อมูลลง LocalStorage ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('shopmak_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('shopmak_categories', JSON.stringify(categories));
    }
  }, [categories]);

  // 3. ระบบจำลอง Login (ตั้งรหัสผ่านง่ายๆ ไว้ก่อน เช่น 1234)
  const loginAdmin = (password: string) => {
    if (password === '1234') { // แก้ไขรหัสผ่านตรงนี้ได้ครับ
      setIsAdminLoggedIn(true);
      localStorage.setItem('shopmak_admin_login', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('shopmak_admin_login');
  };

  return (
    <AppContext.Provider value={{ 
      products, 
      setProducts, 
      categories, 
      setCategories, 
      isAdminLoggedIn, 
      loginAdmin, 
      logoutAdmin 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}