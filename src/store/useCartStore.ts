import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  variant_id?: number;
  variant_name?: string;
  slug?: string;
  name: string;
  price: number;
  discount_price: number | null;
  quantity: number;
  thumbnail_url: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: number, variant_id?: number) => void;
  updateQuantity: (product_id: number, variant_id: number | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === newItem.product_id && item.variant_id === newItem.variant_id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.product_id === newItem.product_id && item.variant_id === newItem.variant_id)
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (product_id, variant_id) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.product_id === product_id && item.variant_id === variant_id)),
        }));
      },
      updateQuantity: (product_id, variant_id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            (item.product_id === product_id && item.variant_id === variant_id) ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.discount_price ?? item.price;
          return total + itemPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'hoantt-cart-storage',
    }
  )
);
