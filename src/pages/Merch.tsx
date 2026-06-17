import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Store, Plus } from 'lucide-react';
import { useCart, merchItems } from '@/contexts/CartContext';
import ProductPreview from '@/components/ProductPreview';
import type { MerchItem } from '@/contexts/CartContext';

const Merch = () => {
  const { addToCart } = useCart();
  const [previewItem, setPreviewItem] = useState<MerchItem | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Merch Store - Dance One Radio"
        description="Shop exclusive Dance One Radio merchandise. Apparel, accessories, and more for electronic music lovers."
        keywords="dance one radio merch, electronic music merchandise, EDM apparel"
      />
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          {/* Hero */}
          <div className="text-center mb-8 sm:mb-12">
            <Store className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-4xl font-['Orbitron'] font-bold text-primary mb-3 sm:mb-4">
              Merch Store
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto px-2">
              Represent the electronic music lifestyle with exclusive Dance One Radio gear.
              All proceeds help keep the station running commercial-free.
            </p>
          </div>

          <GoogleAds key="merch-ad" slot={AD_SLOTS.SIDEBAR} />

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 justify-items-center max-w-5xl mx-auto">
            {merchItems.map((item, idx) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all cursor-pointer group w-full ${
                  item.available
                    ? 'border-primary/20 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10'
                    : 'border-primary/10 opacity-70'
                }`}
                onClick={() => setPreviewItem(item)}
              >
                {/* Image */}
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ objectPosition: item.imagePosition || 'center' }}
                     loading={idx < 3 ? 'eager' : 'lazy'} fetchPriority={idx === 0 ? 'high' : undefined} decoding="async"/>
                  ) : (
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30" />
                  )}
                  {item.available && (
                    <Badge className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[10px] sm:text-xs">Available</Badge>
                  )}
                </div>

                <CardContent className="p-2.5 sm:p-4">
                  <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 leading-tight text-xs sm:text-base">{item.name}</h3>
                  <p className="text-[11px] sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <span className="text-primary font-bold text-sm sm:text-base">{item.price}</span>
                    {item.available ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="gap-1 shrink-0 text-[11px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="opacity-40 cursor-not-allowed shrink-0 text-[11px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
                        Soon
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

      {/* Product Preview Dialog */}
      <ProductPreview
        item={previewItem}
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      />

      <Footer />
    </div>
  );
};

export default Merch;
