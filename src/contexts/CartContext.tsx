import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

import poweredByHouseMusicTee from '@/assets/merch-powered-by-house-music-tee.jpg';
import inHouseWeTrustTee from '@/assets/merch-in-house-we-trust-tee.png';
import blackHat from '@/assets/merch-black-hat-v2.png';
import merchVideo1 from '@/assets/merch-video-1.mp4';
import merchVideo2 from '@/assets/merch-video-2.mp4';

const POWERED_BY_HOUSE_MUSIC_PRICE_ID = 'price_1T21CHGFAEKGp8KzxXkemnMb';

export const AVAILABLE_COLORS = ['White', 'Black', 'Navy', 'Grey', 'Red'] as const;
export const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL'] as const;
export type TeeColor = typeof AVAILABLE_COLORS[number];
export type TeeSize = typeof AVAILABLE_SIZES[number];

export interface MerchItem {
  id: number;
  name: string;
  description: string;
  price: string;
  priceAmount: number;
  image: string | null;
  priceId: string | null;
  available: boolean;
  colors?: readonly string[];
  sizes?: readonly string[];
  videos?: string[];
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
    colors: AVAILABLE_COLORS,
    sizes: AVAILABLE_SIZES,
    videos: [merchVideo1, merchVideo2],
  },
  {
    id: 4,
    name: 'In House We Trust Tee',
    description: 'Dance One — In House We Trust. 4/4 Since Forever.',
    price: '$46.79',
    priceAmount: 46.79,
    image: inHouseWeTrustTee,
    priceId: POWERED_BY_HOUSE_MUSIC_PRICE_ID,
    available: true,
    colors: AVAILABLE_COLORS,
    sizes: AVAILABLE_SIZES,
    videos: [merchVideo1, merchVideo2],
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
  color?: string;
  size?: string;
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

/** Unique key for cart deduplication (id + color + size) */
function cartItemKey(id: number, color?: string, size?: string) {
  return `${id}-${color ?? ''}-${size ?? ''}`;
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: MerchItem, color?: string, size?: string) => void;
  updateQuantity: (id: number, delta: number, color?: string, size?: string) => void;
  removeFromCart: (id: number, color?: string, size?: string) => void;
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

  const addToCart = (item: MerchItem, color?: string, size?: string) => {
    if (!item.priceId) return;
    const key = cartItemKey(item.id, color, size);
    setCart((prev) => {
      const existing = prev.find((c) => cartItemKey(c.id, c.color, c.size) === key);
      if (existing) {
        return prev.map((c) =>
          cartItemKey(c.id, c.color, c.size) === key ? { ...c, quantity: c.quantity + 1 } : c
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
          color,
          size,
        },
      ];
    });
    const variantLabel = [color, size].filter(Boolean).join(' / ');
    toast({ title: 'Added to cart', description: `${item.name}${variantLabel ? ` — ${variantLabel}` : ''}` });
  };

  const updateQuantity = (id: number, delta: number, color?: string, size?: string) => {
    const key = cartItemKey(id, color, size);
    setCart((prev) =>
      prev
        .map((c) => (cartItemKey(c.id, c.color, c.size) === key ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: number, color?: string, size?: string) => {
    const key = cartItemKey(id, color, size);
    setCart((prev) => prev.filter((c) => cartItemKey(c.id, c.color, c.size) !== key));
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
