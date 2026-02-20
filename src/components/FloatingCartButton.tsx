import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ShoppingBag, Plus, Minus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FloatingCartButton = () => {
  const {
    cart, cartCount, cartTotal, cartOpen, setCartOpen,
    updateQuantity, removeFromCart, checkingOut, handleCheckout,
  } = useCart();

  if (cartCount === 0) return null;

  return (
    <>
      {/* Floating button — bottom-right, above the back-to-top button */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-4 z-[9998]"
        >
          <Button
            onClick={() => setCartOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg relative"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-0 text-xs">
              {cartCount}
            </Badge>
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
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
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">${(item.priceAmount * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 mt-1 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-primary font-bold text-lg">${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secure checkout powered by Stripe. Shipping calculated at checkout.
                </p>
                <Button className="w-full gap-2" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {checkingOut ? 'Redirecting...' : 'Checkout with Stripe'}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingCartButton;
