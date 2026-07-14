import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // กำหนด Headers เพื่อจำลองการส่งคำขอจากเว็บเบราว์เซอร์จริง (ป้องกันการโดนบล็อก)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product page');
    }

    const html = await response.text();

    let title = '';
    let price = 0;
    let image = '';

    // 1. ดึงข้อมูลผ่าน Meta Tags (Open Graph) ซึ่งค่อนข้างสม่ำเสมอและแม่นยำที่สุดสำหรับ Shopee/Lazada
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i);
    
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    if (ogImageMatch && ogImageMatch[1]) {
      image = ogImageMatch[1];
    }

    // 2. ดึงราคา (ตรวจหาจากโครงสร้างข้อมูล JSON-LD หรือ Meta Tag ของสินค้า)
    const priceMatch = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']*)["']/i) ||
                       html.match(/<meta[^>]*name=["']twitter:data1["'][^>]*content=["']([^"']*)["']/i) ||
                       html.match(/"price"\s*:\s*"?(\d+[\.\d]*)"?/i);

    if (priceMatch && priceMatch[1]) {
      const parsedPrice = parseFloat(priceMatch[1].replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedPrice)) {
        price = parsedPrice;
      }
    }

    // 3. Fallback หากดึงผ่านวิธีข้างต้นไม่สำเร็จ (วิเคราะห์จาก Title Tag ของหน้าเว็บ)
    if (!title) {
      const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleTagMatch && titleTagMatch[1]) {
        title = titleTagMatch[1].split('|')[0].trim(); // ตัดชื่อร้านด้านหลังออก
      }
    }

    // ตรวจสอบและตัดคลีนหัวข้อขยะของ Shopee/Lazada ออกไปบางส่วน
    if (title) {
      title = title.replace(/ซื้อเลย! | ช้อปเลย | Shopee Thailand| Lazada.co.th/gi, '').trim();
    }

    return NextResponse.json({
      success: !!title,
      title: title || 'พบสินค้าใหม่',
      price: price || null,
      image: image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500',
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}