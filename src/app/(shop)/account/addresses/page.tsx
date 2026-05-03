import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Trash2 } from 'lucide-react';
import { deleteAddress, setDefaultAddress } from './actions';
import { AddressModal } from './address-modal';

export default async function AddressesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; 
  }

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sổ Địa Chỉ</h1>
          <p className="text-muted-foreground mt-1">Quản lý các địa chỉ giao hàng của bạn.</p>
        </div>
        <AddressModal />
      </div>

      {(!addresses || addresses.length === 0) ? (
        <div className="border rounded-2xl p-12 text-center bg-muted/10 border-dashed flex flex-col items-center">
          <MapPin className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Bạn chưa có địa chỉ nào được lưu.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.address_id} className={`border rounded-2xl p-5 bg-card relative ${address.is_default ? 'border-primary ring-1 ring-primary/20' : ''}`}>
               {address.is_default && (
                 <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                   Mặc định
                 </Badge>
               )}
               <div className="font-semibold text-lg mb-1">{address.full_name}</div>
               <div className="text-muted-foreground text-sm mb-3">{address.phone_number}</div>
               <div className="text-sm">
                 <p>{address.detail_address}</p>
                 {address.province && <p>{address.district ? `${address.district}, ${address.province}` : address.province}</p>}
               </div>

               <div className="mt-4 pt-4 border-t flex items-center justify-between">
                 {!address.is_default && (
                   <form action={setDefaultAddress.bind(null, address.address_id)}>
                     <Button type="submit" variant="link" className="px-0 h-auto text-primary">Thiết lập mặc định</Button>
                   </form>
                 )}
                 <form action={deleteAddress.bind(null, address.address_id)}>
                   <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 ml-auto">
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </form>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
