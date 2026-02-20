import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingBag } from 'lucide-react';
import { useCart, type MerchItem } from '@/contexts/CartContext';

interface ProductPreviewProps {
  item: MerchItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductPreview = ({ item, open, onOpenChange }: ProductPreviewProps) => {
  const { addToCart } = useCart();

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square bg-muted flex items-center justify-center relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-24 h-24 text-muted-foreground/20" />
          )}
          {item.available && (
            <Badge className="absolute top-3 right-3">Available</Badge>
          )}
          {!item.available && (
            <Badge variant="secondary" className="absolute top-3 right-3">Coming Soon</Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <DialogTitle className="text-xl font-bold text-foreground leading-tight">
            {item.name}
          </DialogTitle>
          <p className="text-muted-foreground">{item.description}</p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-primary">{item.price}</span>
            {item.available ? (
              <Button
                onClick={() => {
                  addToCart(item);
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </Button>
            ) : (
              <Button disabled className="opacity-40 cursor-not-allowed">
                Coming Soon
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPreview;
