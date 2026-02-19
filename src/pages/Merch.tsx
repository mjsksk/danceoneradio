import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Store, Plus, Minus, Trash2, ShoppingCart, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import poweredByHouseMusicTee from '@/assets/merch-powered-by-house-music-tee.jpg';

const POWERED_BY_HOUSE_MUSIC_PRICE_ID = 'price_1T21CHGFAEKGp8KzxXkemnMb';

// Merch items — only items with a priceId are purchasable
const merchItems = [
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
    name: 'Dance One Logo Tee',
    description: 'Classic logo t-shirt in premium cotton.',
    price: '$29.99',
    priceAmount: 29.99,
    image: null,
    priceId: null,
    available: false,
  },
  {
    id: 3,
    name: 'Dance One Hoodie',
    description: 'Stay warm with our signature hoodie.',
    price: '$54.99',
    priceAmount: 54.99,
    image: null,
    priceId: null,
    available: false,
  },
  {
    id: 4,
    name: 'Dance One Cap',
    description: 'Snapback cap with embroidered logo.',
    price: '$24.99',
    priceAmount: 24.99,
    image: null,
    priceId: null,
    available: false,
  },
  {
    id: 5,
    name: 'Dance One Sticker Pack',
    description: 'Set of 5 vinyl stickers.',
    price: '$9.99',
    priceAmount: 9.99,
    image: null,
    priceId: null,
    available: false,
  },
];

interface CartItem {
  id: number;
  name: string;
  price: string;
  priceAmount: number;
  image: string | null;
  priceId: string;
  quantity: number;
}

const Merch = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);

  const addToCart = (item: typeof merchItems[0]) => {
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
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Merch Store - Dance One Radio"
        description="Shop exclusive Dance One Radio merchandise. Apparel, accessories, and more for electronic music lovers."
        keywords="dance one radio merch, electronic music merchandise, EDM apparel"
      />
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Hero + Cart Button Row */}
          <div className="flex items-start justify-between mb-12">
            <div className="text-center flex-1">
              <Store className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-4">
                Merch Store
              </h1>
              <p className="text-lg text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
                Represent the electronic music lifestyle with exclusive Dance One Radio gear.
                All proceeds help keep the station running commercial-free.
              </p>
            </div>

            {/* Cart Icon */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative mt-2 ml-4 shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-['Orbitron']">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Your Cart
                  </SheetTitle>
                </SheetHeader>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-['Rajdhani']">Your cart is empty</p>
                    <Button variant="outline" size="sm" onClick={() => setCartOpen(false)}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 items-start">
                          <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight">{item.name}</p>
                            <p className="text-primary font-bold text-sm mt-0.5">{item.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">
                              ${(item.priceAmount * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mt-1 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Cart Footer */}
                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <span className="text-primary font-bold text-lg">${cartTotal.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Secure checkout powered by Stripe. Shipping calculated at checkout.
                      </p>
                      <Button
                        className="w-full gap-2"
                        onClick={handleCheckout}
                        disabled={checkingOut}
                      >
                        {checkingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        {checkingOut ? 'Redirecting...' : 'Checkout with Stripe'}
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchItems.map((item) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-colors ${
                  item.available
                    ? 'border-primary/20 hover:border-primary/50'
                    : 'border-primary/10 opacity-70'
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  )}
                  {item.available && (
                    <Badge className="absolute top-2 right-2 text-xs">Available</Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 leading-tight">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-primary font-bold">{item.price}</span>
                    {item.available ? (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="gap-1 shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Cart
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="opacity-40 cursor-not-allowed shrink-0">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success message if redirected back */}
          {new URLSearchParams(window.location.search).get('success') === 'true' && (
            <div className="mt-10 p-6 rounded-lg border border-primary/30 bg-primary/10 text-center">
              <p className="text-primary font-semibold font-['Rajdhani'] text-lg">
                🎉 Order placed! Thank you for supporting Dance One Radio.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Merch;
