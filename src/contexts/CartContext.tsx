import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

import poweredByHouseMusicTee from '@/assets/merch-powered-by-house-music-tee.jpg';
import whiteHat from '@/assets/merch-white-hat.png';
import blackHat from '@/assets/merch-black-hat.png';

const POWERED_BY_HOUSE_MUSIC_PRICE_ID = 'price_1T21CHGFAEKGp8KzxXkemnMb';

export interface MerchItem {
  id: number;
  name: string;
  description: string;
  price: string;
  priceAmount: number;
  image: string | null;
  priceId: string | null;
  available: boolean;
}

export const merchItems: MerchItem[] = [
  {
    id: 1,
    name: 'Powered By House Music Tee',
    description: 'Rep the culture with this bold statement tee.',
    price: '$46.79',
    priceAmount: 46.79,
    image: poweredByHouseMusicTee,
    priceId: POWERED_BY_HOUSE_MUSIC_PRICE_ID,
    available: true,
  },
  {
    id: 2,
    name: 'White High Quality Curved 5 Panel Hat',
    description: 'Premium curved 5 panel hat in crisp white with embroidered logo.',
    price: '$59.87',
    priceAmount: 59.87,
    image: whiteHat,
    priceId: 'price_1T2zfiGFAEKGp8KzYM9DJjoU',
    available: true,
  },
  {
    id: 3,
    name: 'Black High Quality Curved 5 Panel Hat',
    description: 'Premium curved 5 panel hat in sleek black with embroidered logo.',
    price: '$59.87',
    priceAmount: 59.87,
    image: blackHat,
    priceId: 'price_1T2zlSGFAEKGp8KzUFCpExls',
    available: true,
  },
];

export interface CartItem {
  id: number;
  name: string;
  price: string;
  priceAmount: number;
  image: string | null;
  priceId: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'dance-one-merch-cart';
const CART_TTL_MS = 24 * 60 * 60 * 1000;

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const { items, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    return items as CartItem[];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (items.length === 0) {
    localStorage.removeItem(CART_STORAGE_KEY);
  } else {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, expiresAt: Date.now() + CART_TTL_MS })
    );
  }
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: MerchItem) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  checkingOut: boolean;
  handleCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);

  const addToCart = (item: MerchItem) => {
    if (!item.priceId) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          priceAmount: item.priceAmount,
          image: item.image,
          priceId: item.priceId!,
          quantity: 1,
        },
      ];
    });
    toast({ title: 'Added to cart', description: item.name });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const lineItems = cart.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      }));
      const { data, error } = await supabase.functions.invoke('create-merch-checkout', {
        body: { lineItems },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || 'Failed to create checkout session');
      }
      window.open(data.url, '_blank');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast({ title: 'Checkout error', description: msg, variant: 'destructive' });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart, cartCount, cartTotal, cartOpen, setCartOpen,
        addToCart, updateQuantity, removeFromCart, checkingOut, handleCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
