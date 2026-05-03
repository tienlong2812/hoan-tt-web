'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

function generateSlug(text: string) {
  if (!text) return '';
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

export async function importProductsAction(formData: FormData) {
  const file = formData.get('excelFile') as File | null;
  
  if (!file || file.size === 0) {
    throw new Error("Vui lòng chọn file Excel.");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Read file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Parse Excel
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

  if (!jsonData || jsonData.length === 0) {
    throw new Error("File Excel không có dữ liệu.");
  }

  // Map to Supabase Schema
  const insertPayloads = jsonData.map(row => {
    const productName = row['product_name'] || row['Tên sản phẩm'];
    if (!productName) return null; // Skip rows without name

    return {
      product_name: productName,
      slug: generateSlug(productName),
      sku: row['sku'] || row['SKU'] || null,
      price: parseInt(row['price'] || row['Giá']) || 0,
      discount_price: parseInt(row['discount_price'] || row['Giá khuyến mãi']) || null,
      stock: parseInt(row['stock'] || row['Tồn kho']) || 0,
      status: row['status'] || row['Trạng thái'] || 'active',
      origin: row['origin'] || row['Xuất xứ'] || null,
      description: row['description'] || row['Mô tả'] || null,
      category_id: parseInt(row['category_id'] || row['Danh mục ID']) || null,
      brand_id: parseInt(row['brand_id'] || row['Thương hiệu ID']) || null,
    };
  }).filter(Boolean); // remove nulls

  if (insertPayloads.length === 0) {
    throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
  }

  // Insert in bulk
  const { error } = await supabase.from('products').insert(insertPayloads);

  if (error) {
    console.error("Bulk Insert Error:", error);
    throw new Error("Đã có lỗi xảy ra khi import dữ liệu.");
  }

  revalidatePath('/admin/products');
}
