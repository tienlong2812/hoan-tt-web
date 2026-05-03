'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

type Variant = {
  variant_id?: number;
  variant_name: string;
  sku: string;
  price: number;
  stock: number;
};

export function VariantList({ initialVariants = [] }: { initialVariants?: Variant[] }) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);

  const addVariant = () => {
    setVariants([...variants, { variant_name: '', sku: '', price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  return (
    <div className="space-y-4 border p-4 rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Biến thể Sản phẩm</h3>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-4 w-4 mr-2" /> Thêm Biến thể
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">Nếu sản phẩm có nhiều phân loại (ví dụ: Khối lượng, Hương vị), hãy thêm biến thể. Nếu bỏ trống, sản phẩm sẽ là sản phẩm đơn.</p>

      {/* Hidden input to submit via FormData */}
      <input type="hidden" name="variants_json" value={JSON.stringify(variants)} />

      <div className="space-y-4 mt-4">
        {variants.map((v, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20 relative group">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Tên phân loại *</Label>
                <Input 
                  placeholder="VD: Hộp 500g" 
                  value={v.variant_name} 
                  onChange={(e) => updateVariant(index, 'variant_name', e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Giá (VNĐ) *</Label>
                <Input 
                  type="number" 
                  value={v.price} 
                  onChange={(e) => updateVariant(index, 'price', Number(e.target.value))} 
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SKU</Label>
                <Input 
                  value={v.sku} 
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tồn kho</Label>
                <Input 
                  type="number" 
                  value={v.stock} 
                  onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))} 
                />
              </div>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => removeVariant(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
