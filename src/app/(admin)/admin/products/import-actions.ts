'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

type ProductImportRow = Record<string, string | number | null | undefined>;

type ProductImportPayload = {
  product_name: string;
  slug: string;
  base_price: number;
  weight: number | null;
  status: string;
  origin: string | null;
  description: string | null;
  category_id: number | null;
  brand_id: number | null;
};

function generateSlug(text: string) {
  if (!text) return '';
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

function numberFromCell(value: string | number | null | undefined) {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
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
  const jsonData = XLSX.utils.sheet_to_json<ProductImportRow>(worksheet);

  if (!jsonData || jsonData.length === 0) {
    throw new Error("File Excel không có dữ liệu.");
  }

  // Map to Supabase Schema
  const insertPayloads = jsonData.map((row): ProductImportPayload | null => {
    const productName = row['product_name'] || row['Tên sản phẩm'];
    if (!productName) return null; // Skip rows without name
    const productNameText = String(productName);

    return {
      product_name: productNameText,
      slug: generateSlug(productNameText),
      base_price: numberFromCell(row['base_price'] || row['price'] || row['Giá']),
      weight: numberFromCell(row['weight'] || row['Khối lượng']) || null,
      status: String(row['status'] || row['Trạng thái'] || 'active'),
      origin: row['origin'] || row['Xuất xứ'] ? String(row['origin'] || row['Xuất xứ']) : null,
      description: row['description'] || row['Mô tả'] ? String(row['description'] || row['Mô tả']) : null,
      category_id: numberFromCell(row['category_id'] || row['Danh mục ID']) || null,
      brand_id: numberFromCell(row['brand_id'] || row['Thương hiệu ID']) || null,
    };
  }).filter((row): row is ProductImportPayload => row !== null);

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
