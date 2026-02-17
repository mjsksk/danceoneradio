import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Store } from 'lucide-react';

// Placeholder merch items — replace with real products + Stripe price IDs later
const merchItems = [
  {
    id: 1,
    name: 'Dance One Logo Tee',
    description: 'Classic logo t-shirt in premium cotton.',
    price: '$29.99',
    image: null, // Will be replaced with uploaded image
    priceId: null, // Stripe price_id to be added
  },
  {
    id: 2,
    name: 'Dance One Hoodie',
    description: 'Stay warm with our signature hoodie.',
    price: '$54.99',
    image: null,
    priceId: null,
  },
  {
    id: 3,
    name: 'Dance One Cap',
    description: 'Snapback cap with embroidered logo.',
    price: '$24.99',
    image: null,
    priceId: null,
  },
  {
    id: 4,
    name: 'Dance One Sticker Pack',
    description: 'Set of 5 vinyl stickers.',
    price: '$9.99',
    image: null,
    priceId: null,
  },
];

const Merch = () => {
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

          {/* Coming Soon Banner */}
          <div className="card-cyber p-6 mb-10 text-center bg-primary/5">
            <p className="text-primary font-semibold text-lg font-['Rajdhani']">
              🚧 Store launching soon — check back for updates!
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors">
                {/* Image placeholder */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{item.price}</span>
                    <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Merch;
