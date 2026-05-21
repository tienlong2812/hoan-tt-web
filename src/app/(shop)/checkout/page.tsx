'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createOrderAction } from './actions';
import { fetchMyAddresses } from './address-actions';
import { CouponInput } from './coupon-input';

type CouponResult = {
  coupon_id: number;
  discount_amount: number;
  message: string;
};

interface AddressNode {
  code: string;
  name: string;
  name_with_type: string;
  'quan-huyen'?: Record<string, AddressNode>;
  'xa-phuong'?: Record<string, AddressNode>;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [newPhone, setNewPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const router = useRouter();

  const [addressData, setAddressData] = useState<Record<string, AddressNode>>({});
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  useEffect(() => {
    fetch('/data/vn-provinces.json')
      .then(res => res.json())
      .then(data => setAddressData(data))
      .catch(err => console.error("Failed to load address data:", err));
  }, []);

  const provinces = useMemo(() => {
    return Object.values(addressData).sort((a, b) => a.name.localeCompare(b.name));
  }, [addressData]);

  const districts = useMemo(() => {
    if (!selectedProvinceCode || !addressData[selectedProvinceCode]) return [];
    const quanHuyen = addressData[selectedProvinceCode]['quan-huyen'];
    if (!quanHuyen) return [];
    return Object.values(quanHuyen).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProvinceCode, addressData]);

  const wards = useMemo(() => {
    if (!selectedProvinceCode || !selectedDistrictCode || !addressData[selectedProvinceCode]) return [];
    const dist = addressData[selectedProvinceCode]['quan-huyen']?.[selectedDistrictCode];
    if (!dist || !dist['xa-phuong']) return [];
    return Object.values(dist['xa-phuong']).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProvinceCode, selectedDistrictCode, addressData]);

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 1000000 ? 0 : 30000;
  const discountAmount = coupon?.discount_amount || 0;
  const totalAmount = subtotal + shippingFee - discountAmount;

  useEffect(() => {
    setMounted(true);
    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống.');
      router.push('/cart');
    } else {
      fetchMyAddresses().then(data => {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].address_id.toString());
        }
      });
    }
  }, [items, router]);

  if (!mounted || items.length === 0) return null;

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const paymentMethod = formData.get('payment_method') as string;
    const result = await createOrderAction(
      formData,
      items,
      totalAmount,
      coupon?.coupon_id || null,
      discountAmount
    );
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      if (paymentMethod === 'BankTransfer' && result.orderId) {
        toast.success('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
        clearCart();
        router.push('/account/orders');
      } else {
        toast.success('Đặt hàng thành công!');
        clearCart();
        router.push('/account/orders');
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Thanh Toán</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">Thông Tin Giao Hàng</h2>

          {addresses.length > 0 && (
            <div className="mb-6 space-y-2">
              <Label>Chọn địa chỉ đã lưu</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.map((addr: any) => (
                  <option key={addr.address_id} value={addr.address_id.toString()}>
                    {addr.receiver_name} - {addr.receiver_phone} ({addr.detail_address}, {addr.province})
                  </option>
                ))}
                <option value="new">+ Nhập địa chỉ mới</option>
              </select>
            </div>
          )}

          <form id="checkout-form" action={onSubmit} className="space-y-6">
            <input type="hidden" name="address_id" value={selectedAddressId} />
            {selectedAddressId === 'new' ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver_name" className="text-sm font-semibold uppercase tracking-wide">Họ và tên *</Label>
                    <Input id="receiver_name" name="receiver_name" required placeholder="Nhập họ và tên người nhận" className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver_phone" className="text-sm font-semibold uppercase tracking-wide">Số điện thoại *</Label>
                    <Input id="receiver_phone" name="receiver_phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} required placeholder="Ví dụ: 0941331046" className="h-11" />
                  </div>

                  <input type="hidden" name="province" value={addressData?.[selectedProvinceCode]?.name_with_type || ''} />
                  <input type="hidden" name="district" value={addressData?.[selectedProvinceCode]?.['quan-huyen']?.[selectedDistrictCode]?.name_with_type || ''} />
                  <input type="hidden" name="ward" value={addressData?.[selectedProvinceCode]?.['quan-huyen']?.[selectedDistrictCode]?.['xa-phuong']?.[selectedWardCode]?.name_with_type || ''} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-semibold uppercase tracking-wide">Tỉnh/Thành phố *</Label>
                      <select 
                        id="province"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedProvinceCode}
                        onChange={(e) => {
                          setSelectedProvinceCode(e.target.value);
                          setSelectedDistrictCode('');
                          setSelectedWardCode('');
                        }}
                        required
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>{p.name_with_type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-semibold uppercase tracking-wide">Quận/Huyện *</Label>
                      <select 
                        id="district"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedDistrictCode}
                        onChange={(e) => {
                          setSelectedDistrictCode(e.target.value);
                          setSelectedWardCode('');
                        }}
                        required
                        disabled={!selectedProvinceCode}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>{d.name_with_type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ward" className="text-sm font-semibold uppercase tracking-wide">Xã/Phường/Thị trấn *</Label>
                      <select 
                        id="ward"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedWardCode}
                        onChange={(e) => setSelectedWardCode(e.target.value)}
                        required
                        disabled={!selectedDistrictCode}
                      >
                        <option value="">Chọn Xã/Phường/Thị trấn</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>{w.name_with_type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detail_address" className="text-sm font-semibold uppercase tracking-wide">Địa chỉ *</Label>
                      <Input id="detail_address" name="detail_address" required placeholder="Ví dụ: 86 ngõ 75 giải phóng" className="h-11" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden">
                <Input name="receiver_name" value={addresses.find(a => a.address_id.toString() === selectedAddressId)?.full_name || ''} readOnly />
                <Input name="receiver_phone" value={addresses.find(a => a.address_id.toString() === selectedAddressId)?.phone_number || ''} readOnly />
                <Input name="province" value={addresses.find(a => a.address_id.toString() === selectedAddressId)?.province || ''} readOnly />
                <Input name="district" value={addresses.find(a => a.address_id.toString() === selectedAddressId)?.district || ''} readOnly />
                <Input name="ward" value={addresses.find(a => a.address_id.toString() === selectedAddressId)?.ward || ''} readOnly />
                <Input name="detail_address" value={`${addresses.find(a => a.address_id.toString() === selectedAddressId)?.detail_address || ''}`.trim()} readOnly />
              </div>
            )}

            <Separator className="my-8" />
            <h2 className="text-xl font-semibold mb-6">Phương Thức Thanh Toán</h2>

            <div className="space-y-4">
              <Label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input type="radio" name="payment_method" value="COD" checked={selectedPayment === 'COD'} onChange={() => setSelectedPayment('COD')} className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <span className="font-medium block">Thanh toán khi nhận hàng (COD)</span>
                  <span className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi Shipper giao hàng tới</span>
                </div>
              </Label>

              <Label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input type="radio" name="payment_method" value="BankTransfer" checked={selectedPayment === 'BankTransfer'} onChange={() => setSelectedPayment('BankTransfer')} className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <span className="font-medium block">Chuyển khoản Ngân hàng (VietQR)</span>
                  <span className="text-sm text-muted-foreground">Chuyển khoản nhanh chóng qua mã QR</span>
                </div>
                <div className="flex gap-0.5 items-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                  <span className="font-bold italic text-blue-700">Viet</span><span className="font-bold italic text-green-600">QR</span>
                </div>
              </Label>

              {selectedPayment === 'BankTransfer' && (
                <div className="ml-7 p-4 border rounded-xl bg-card shadow-sm mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <h3 className="font-medium mb-3 text-primary text-center">Quét QR để thanh toán ngay</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-2 bg-white rounded-xl border-2 border-primary/20">
                      <img
                        src={`https://qr.sepay.vn/img?acc=4880683549&bank=BIDV&amount=${totalAmount}&des=${encodeURIComponent('Thanh toan ' + (selectedAddressId === 'new' ? newPhone : addresses.find(a => a.address_id.toString() === selectedAddressId)?.receiver_phone || 'don hang'))}`}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <div className="text-sm text-center space-y-1">
                      <p>Ngân hàng: <strong className="text-blue-700">BIDV</strong></p>
                      <p>Chủ tài khoản: <strong>HOAN TT</strong></p>
                      <p>Số tài khoản: <strong>4880683549</strong></p>
                      <p>Số tiền: <strong className="text-primary text-lg">{totalAmount.toLocaleString('vi-VN')} ₫</strong></p>
                      <p>Nội dung: <strong className="font-mono bg-muted px-1.5 py-0.5 rounded">Thanh toan {selectedAddressId === 'new' ? (newPhone || '<SĐT>') : (addresses.find(a => a.address_id.toString() === selectedAddressId)?.receiver_phone || 'don hang')}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              <Label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input type="radio" name="payment_method" value="VNPay" checked={selectedPayment === 'VNPay'} onChange={() => setSelectedPayment('VNPay')} className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <span className="font-medium block">Thanh toán qua VNPay</span>
                  <span className="text-sm text-muted-foreground">Quét mã QR qua ứng dụng ngân hàng hoặc ví VNPay</span>
                </div>
                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" className="h-6 object-contain" />
              </Label>

              <Label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input type="radio" name="payment_method" value="ZaloPay" checked={selectedPayment === 'ZaloPay'} onChange={() => setSelectedPayment('ZaloPay')} className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <span className="font-medium block">Thanh toán qua ZaloPay</span>
                  <span className="text-sm text-muted-foreground">Thanh toán nhanh chóng bằng ví điện tử ZaloPay</span>
                </div>
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="h-6 rounded-md object-contain" />
              </Label>

              <Label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input type="radio" name="payment_method" value="Momo" checked={selectedPayment === 'Momo'} onChange={() => setSelectedPayment('Momo')} className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <span className="font-medium block">Thanh toán qua MoMo</span>
                  <span className="text-sm text-muted-foreground">Thanh toán bằng ví điện tử MoMo</span>
                </div>
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" alt="Momo" className="h-6 rounded-md object-contain" />
              </Label>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-muted/10 border rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-6">Tóm Tắt Đơn Hàng</h2>
            <div className="space-y-4 text-sm mb-6 max-h-[300px] overflow-auto pr-2">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.variant_id ?? 'base'}`} className="flex justify-between items-center bg-card p-2 rounded-lg border">
                  <div className="flex gap-3 items-center">
                    <img src={item.thumbnail_url || ''} alt="" className="w-12 h-12 rounded-md object-cover border" />
                    <div>
                      <p className="font-medium line-clamp-1 max-w-[140px] md:max-w-[180px]">{item.name}</p>
                      {item.variant_name && (
                        <p className="text-xs text-primary font-medium">{item.variant_name}</p>
                      )}
                      <p className="text-muted-foreground">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary pl-2">
                    {((item.discount_price ?? item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Mã giảm giá</p>
              <CouponInput orderTotal={subtotal} onApply={setCoupon} />
            </div>

            <Separator className="my-4" />
            <div className="space-y-3 mb-6 font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-500">Miễn phí</span>
                ) : (
                  <span>{shippingFee.toLocaleString('vi-VN')} ₫</span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary pt-2">
                <span>Tổng Cộng</span>
                <span className="text-2xl">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className="w-full rounded-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? 'Đang Xử Lý...' : 'Đặt Hàng Ngay'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
