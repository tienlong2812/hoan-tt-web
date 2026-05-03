import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  // Define template data
  const data = [
    {
      product_name: 'Sản phẩm mẫu 1',
      sku: 'SP001',
      price: 150000,
      discount_price: 120000,
      stock: 100,
      status: 'active',
      origin: 'Hàn Quốc',
      category_id: 1,
      brand_id: 1,
      description: 'Mô tả chi tiết sản phẩm 1'
    },
    {
      product_name: 'Sản phẩm mẫu 2',
      sku: 'SP002',
      price: 200000,
      discount_price: '',
      stock: 50,
      status: 'active',
      origin: 'Úc',
      category_id: '',
      brand_id: '',
      description: 'Mô tả chi tiết sản phẩm 2'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Generate buffer
  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="Mau_Nhap_San_Pham.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
