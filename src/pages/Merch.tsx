import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
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
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Hero */}
          <div className="text-center mb-12">
            <Store className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-4">
              Merch Store
            </h1>
            <p className="text-lg text-muted-foreground font-['Rajdhani'] max-w-2xl mx-auto">
              Represent the electronic music lifestyle with exclusive Dance One Radio gear.
              All proceeds help keep the station running commercial-free.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchItems.map((item) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all cursor-pointer group ${
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
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  )}
                  {item.available && (
                    <Badge className="absolute top-2 right-2 text-xs">Available</Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 leading-tight">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-primary font-bold">{item.price}</span>
                    {item.available ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
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
