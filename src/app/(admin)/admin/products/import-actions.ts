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
      base_price: parseInt(row['base_price'] || row['price'] || row['Giá']) || 0,
      weight: parseFloat(row['weight'] || row['Khối lượng']) || null,
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

export async function getProductsForExport(filters: { q?: string; category?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('products')
    .select('*, brands(brand_name), categories(category_name)')
    .order('created_at', { ascending: false });

  if (filters.q) {
    query = query.ilike('product_name', `%${filters.q}%`);
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products for export:', error);
    throw new Error('Failed to fetch products');
  }

  return data;
}
