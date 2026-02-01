import { useRef, useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageData {
  url: string;
  explicit?: boolean;
}

interface GalleryLightboxProps {
  images: ImageData[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  altPrefix: string;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

const GalleryLightbox = ({
  images,
  selectedIndex,
  onClose,
  onNavigate,
  altPrefix,
}: GalleryLightboxProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [direction, setDirection] = useState(0);

  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null) {
      setDirection(-1);
      onNavigate((selectedIndex - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null) {
      setDirection(1);
      onNavigate((selectedIndex + 1) % images.length);
    }
  }, [selectedIndex, images.length, onNavigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    },
    [handlePrevious, handleNext, onClose]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Check if swipe meets threshold
      if (
        Math.abs(offset.x) > SWIPE_THRESHOLD ||
        Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD
      ) {
        if (offset.x > 0 || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    },
    [handlePrevious, handleNext]
  );

  // Reset loaded state when image changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [selectedIndex]);

  // Preload adjacent images
  useEffect(() => {
    if (selectedIndex === null) return;

    const preloadIndexes = [
      (selectedIndex - 1 + images.length) % images.length,
      (selectedIndex + 1) % images.length,
    ];

    preloadIndexes.forEach((index) => {
      const img = new Image();
      img.src = images[index].url;
    });
  }, [selectedIndex, images]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-sm border-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden touch-pan-y">
          {selectedIndex !== null && (
            <>
              {/* Loading spinner */}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={selectedIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={images[selectedIndex].url}
                    alt={`${altPrefix} - Photo ${selectedIndex + 1}`}
                    className={cn(
                      "max-w-full max-h-[90vh] object-contain select-none transition-opacity duration-300",
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setIsImageLoaded(true)}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons - hidden on mobile */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background hidden md:flex"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background hidden md:flex"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background z-10"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image Counter & Swipe hint on mobile */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="bg-background/80 px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
                <span className="text-xs text-muted-foreground md:hidden">
                  Swipe to navigate
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
