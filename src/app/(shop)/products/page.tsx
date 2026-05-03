import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ProductCard } from '@/components/product/product-card';
import Link from 'next/link';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; category?: string; minPrice?: string; maxPrice?: string }>; // Next.js 15 typing
}) {
  const resolvedSearchParams = await searchParams; // Await the promise
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  function generateSlug(text: string) {
    if (!text) return '';
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }

  let query = supabase
    .from('products')
    .select('*, brands(brand_name), categories(category_name, slug)')
    .eq('status', 'active');

  if (resolvedSearchParams.q) {
    query = query.ilike('product_name', `%${resolvedSearchParams.q}%`);
  }

  if (resolvedSearchParams.brand) {
    const brandsArray = resolvedSearchParams.brand.split(',');
    if (brandsArray.length > 0) {
      const { data: allBrands } = await supabase.from('brands').select('brand_id, brand_name');
      const matchingIds = allBrands
        ?.filter(b => brandsArray.includes(generateSlug(b.brand_name)))
        .map(b => b.brand_id) || [];
        
      console.log("DEBUG BRAND:", { search: resolvedSearchParams.brand, brandsArray, allBrands, matchingIds });
      
      if (matchingIds.length > 0) {
        query = query.in('brand_id', matchingIds);
      } else {
        query = query.eq('product_id', -1); // Force empty if brand not found
      }
    }
  }

  if (resolvedSearchParams.category) {
    const categoriesArray = resolvedSearchParams.category.split(',');
    if (categoriesArray.length > 0) {
      const { data: catMatches } = await supabase.from('categories').select('category_id').in('slug', categoriesArray);
      if (catMatches && catMatches.length > 0) {
        query = query.in('category_id', catMatches.map(c => c.category_id));
      } else {
        query = query.eq('product_id', -1); // Force empty if category not found
      }
    }
  }

  if (resolvedSearchParams.minPrice) {
    query = query.gte('price', resolvedSearchParams.minPrice);
  }

  if (resolvedSearchParams.maxPrice) {
    query = query.lte('price', resolvedSearchParams.maxPrice);
  }

  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    query.order('created_at', { ascending: false }),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*')
  ]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {resolvedSearchParams.q ? `Kết quả tìm kiếm cho "${resolvedSearchParams.q}"` : 'Tất Cả Sản Phẩm'}
        </h1>
        <p className="text-muted-foreground mt-2">Khám phá danh mục các sản phẩm chăm sóc sức khỏe tốt nhất từ Hoan TT.</p>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-8">
        {/* Filters Sidebar */}
        <div className="hidden lg:block space-y-6 shrink-0">
           <div className="border rounded-2xl p-5 bg-card">
             <h3 className="font-bold text-lg mb-4">Danh mục</h3>
             <div className="space-y-3">
               {categories?.map(c => {
                 const isSelected = resolvedSearchParams.category?.includes(c.slug);
                 const newCategoryParam = isSelected 
                  ? resolvedSearchParams.category?.split(',').filter(x => x !== c.slug).join(',') // Remove
                  : resolvedSearchParams.category ? `${resolvedSearchParams.category},${c.slug}` : c.slug; // Add
                 
                 return (
                   <Link 
                     key={c.category_id} 
                     href={`/products?category=${newCategoryParam || ''}${resolvedSearchParams.brand ? `&brand=${resolvedSearchParams.brand}` : ''}`}
                     className="flex items-center gap-3 group"
                   >
                     <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-primary border-primary flex items-center justify-center' : 'border-input group-hover:border-primary'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                     </div>
                     <span className={`${isSelected ? 'font-medium text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{c.category_name}</span>
                   </Link>
                 )
               })}
             </div>
          </div>

          <div className="border rounded-2xl p-5 bg-card">
             <h3 className="font-bold text-lg mb-4">Thương hiệu</h3>
             <div className="space-y-3">
               {brands?.map(b => {
                 const bSlug = generateSlug(b.brand_name);
                 const isSelected = resolvedSearchParams.brand?.includes(bSlug);
                 const newBrandParam = isSelected 
                  ? resolvedSearchParams.brand?.split(',').filter(x => x !== bSlug).join(',') // Remove
                  : resolvedSearchParams.brand ? `${resolvedSearchParams.brand},${bSlug}` : bSlug; // Add
                 
                 return (
                   <Link 
                     key={b.brand_id} 
                     href={`/products?brand=${newBrandParam || ''}${resolvedSearchParams.category ? `&category=${resolvedSearchParams.category}` : ''}`}
                     className="flex items-center gap-3 group"
                   >
                     <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-primary border-primary flex items-center justify-center' : 'border-input group-hover:border-primary'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                     </div>
                     <span className={`${isSelected ? 'font-medium text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{b.brand_name}</span>
                   </Link>
                 )
               })}
             </div>
          </div>
          
          <div className="border rounded-2xl p-5 bg-card">
             <h3 className="font-bold text-lg mb-4">Khoảng giá</h3>
             <div className="space-y-4">
               <Link href={`/products?${resolvedSearchParams.brand ? `brand=${resolvedSearchParams.brand}&` : ''}maxPrice=500000`} className="block text-sm text-muted-foreground hover:text-primary">Dưới 500,000đ</Link>
               <Link href={`/products?${resolvedSearchParams.brand ? `brand=${resolvedSearchParams.brand}&` : ''}minPrice=500000&maxPrice=1000000`} className="block text-sm text-muted-foreground hover:text-primary">500,000đ - 1,000,000đ</Link>
               <Link href={`/products?${resolvedSearchParams.brand ? `brand=${resolvedSearchParams.brand}&` : ''}minPrice=1000000`} className="block text-sm text-muted-foreground hover:text-primary">Trên 1,000,000đ</Link>
               {(resolvedSearchParams.minPrice || resolvedSearchParams.maxPrice) && (
                 <Link href={`/products?${resolvedSearchParams.brand ? `brand=${resolvedSearchParams.brand}` : ''}`} className="text-xs text-primary underline mt-2 block">Xóa lọc giá</Link>
               )}
             </div>
          </div>
        </div>

        {/* Product Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="py-24 w-full text-center border rounded-xl bg-muted/10 border-dashed flex items-center justify-center flex-col">
            <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-6">Xin thử thay đổi các tùy chọn bộ lọc.</p>
            <Link href="/products" className="text-primary hover:underline">Xóa tất cả bộ lọc</Link>
          </div>
        )}
      </div>
    </div>
  );
}
