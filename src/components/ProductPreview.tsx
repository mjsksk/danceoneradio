import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingBag, Play, X } from 'lucide-react';
import { useCart, type MerchItem } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductPreviewProps {
  item: MerchItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_MAP: Record<string, string> = {
  White: '#ffffff',
  Black: '#1a1a1a',
  Navy: '#1e3a5f',
  Grey: '#808080',
  Red: '#c0392b',
};

const ProductPreviewContent = ({
  item,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  activeView,
  setActiveView,
  handleAdd,
  canAdd,
  hasVariants,
  hasVideos,
}: {
  item: MerchItem;
  selectedColor: string | undefined;
  setSelectedColor: (c: string | undefined) => void;
  selectedSize: string | undefined;
  setSelectedSize: (s: string | undefined) => void;
  activeView: 'image' | number;
  setActiveView: (v: 'image' | number) => void;
  handleAdd: () => void;
  canAdd: boolean;
  hasVariants: boolean;
  hasVideos: boolean;
}) => (
  <>
    {/* Media area */}
    <div className="aspect-square bg-muted flex items-center justify-center relative">
      {activeView === 'image' ? (
        (() => {
          const displayImage = (selectedColor && item.colorImages?.[selectedColor]) || item.image;
          return displayImage ? (
            <img src={displayImage} alt={item.name} className="w-full h-full object-cover" style={{ objectPosition: item.imagePosition || 'center' }}  loading="lazy" decoding="async"/>
          ) : (
            <ShoppingBag className="w-24 h-24 text-muted-foreground/20" />
          );
        })()
      ) : (
        <video
          src={item.videos?.[activeView]}
          controls
          autoPlay
          className="w-full h-full object-cover"
        />
      )}
      {item.available && activeView === 'image' && (
        <Badge className="absolute top-3 right-3">Available</Badge>
      )}
      {!item.available && (
        <Badge variant="secondary" className="absolute top-3 right-3">Coming Soon</Badge>
      )}
    </div>

    {/* Video thumbnails */}
    {hasVideos && (
      <div className="flex gap-2 px-4 sm:px-6 pt-4">
        <button
          onClick={() => setActiveView('image')}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 transition-colors flex-shrink-0 ${activeView === 'image' ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
        >
          {item.image ? (
            <img src={item.image} alt="Product" className="w-full h-full object-cover"  loading="lazy" decoding="async"/>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-muted-foreground/40" />
            </div>
          )}
        </button>
        {item.videos!.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveView(idx)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 transition-colors bg-muted flex items-center justify-center flex-shrink-0 ${activeView === idx ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
          >
            <Play className="w-5 h-5 text-primary" />
          </button>
        ))}
      </div>
    )}

    {/* Product Info */}
    <div className="p-4 sm:p-6 pt-4 space-y-3 sm:space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
        {item.name}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>

      {/* Color selector */}
      {item.colors && item.colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Color{selectedColor ? `: ${selectedColor}` : ''}
          </p>
          <div className="flex gap-2 flex-wrap">
            {item.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-primary ring-2 ring-primary/30 scale-110'
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ backgroundColor: COLOR_MAP[color] || color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {item.sizes && item.sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Size</p>
          <div className="flex gap-2 flex-wrap">
            {item.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:border-primary/50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 gap-3">
        <span className="text-xl sm:text-2xl font-bold text-primary">{item.price}</span>
        {item.available ? (
          <Button
            onClick={handleAdd}
            className="gap-2"
            disabled={!canAdd}
          >
            <Plus className="w-4 h-4" />
            {hasVariants && !canAdd ? 'Select options' : 'Add to Cart'}
          </Button>
        ) : (
          <Button disabled className="opacity-40 cursor-not-allowed">
            Coming Soon
          </Button>
        )}
      </div>
    </div>
  </>
);

const ProductPreview = ({ item, open, onOpenChange }: ProductPreviewProps) => {
  const { addToCart } = useCart();
  const isMobile = useIsMobile();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [activeView, setActiveView] = useState<'image' | number>('image');

  if (!item) return null;

  const hasVariants = !!(item.colors?.length || item.sizes?.length);
  const hasVideos = !!(item.videos?.length);
  const canAdd = item.available && (!hasVariants || (selectedColor && selectedSize));

  const handleAdd = () => {
    addToCart(item, selectedColor, selectedSize);
    onOpenChange(false);
    setSelectedColor(undefined);
    setSelectedSize(undefined);
    setActiveView('image');
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setSelectedColor(undefined);
      setSelectedSize(undefined);
      setActiveView('image');
    }
    onOpenChange(o);
  };

  const contentProps = {
    item,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    activeView,
    setActiveView,
    handleAdd,
    canAdd: !!canAdd,
    hasVariants,
    hasVideos,
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerTitle className="sr-only">{item.name}</DrawerTitle>
          <div className="overflow-y-auto relative">
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center"
              aria-label="Close preview"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            <ProductPreviewContent {...contentProps} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <ProductPreviewContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
};

export default ProductPreview;
