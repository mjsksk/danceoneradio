import { useRef, useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
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
const MIN_SCALE = 1;
const MAX_SCALE = 4;

const GalleryLightbox = ({
  images,
  selectedIndex,
  onClose,
  onNavigate,
  altPrefix,
}: GalleryLightboxProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);

  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null && !isZoomed) {
      setDirection(-1);
      onNavigate((selectedIndex - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length, onNavigate, isZoomed]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && !isZoomed) {
      setDirection(1);
      onNavigate((selectedIndex + 1) % images.length);
    }
  }, [selectedIndex, images.length, onNavigate, isZoomed]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") {
        if (isZoomed) {
          resetZoom();
        } else {
          onClose();
        }
      }
    },
    [handlePrevious, handleNext, onClose, isZoomed]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isZoomed || isPinching.current) return;
      
      const { offset, velocity } = info;

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
    [handlePrevious, handleNext, isZoomed]
  );

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.min(prev * 1.5, MAX_SCALE);
      setIsZoomed(newScale > 1);
      return newScale;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.5, MIN_SCALE);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      }
      return newScale;
    });
  }, []);

  const handleDoubleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isZoomed) {
      resetZoom();
    } else {
      setScale(2.5);
      setIsZoomed(true);
    }
  }, [isZoomed, resetZoom]);

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      isPinching.current = true;
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const scaleChange = distance / lastTouchDistance.current;
      const newScale = Math.min(Math.max(scale * scaleChange, MIN_SCALE), MAX_SCALE);

      setScale(newScale);
      setIsZoomed(newScale > 1);
      lastTouchDistance.current = distance;

      // Pan while zoomed
      if (lastTouchCenter.current && newScale > 1) {
        const currentCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
        setPosition((prev) => ({
          x: prev.x + (currentCenter.x - lastTouchCenter.current!.x),
          y: prev.y + (currentCenter.y - lastTouchCenter.current!.y),
        }));
        lastTouchCenter.current = currentCenter;
      }
    } else if (e.touches.length === 1 && isZoomed) {
      // Single finger pan when zoomed
      e.preventDefault();
    }
  }, [scale, isZoomed]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
      // Delay resetting isPinching to prevent swipe from triggering
      setTimeout(() => {
        isPinching.current = false;
      }, 100);
      
      // Snap back to min scale if below threshold
      if (scale < 1.1) {
        resetZoom();
      }
    }
  }, [scale, resetZoom]);

  // Handle panning when zoomed
  const handlePan = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isZoomed && !isPinching.current) {
        setPosition((prev) => ({
          x: prev.x + info.delta.x,
          y: prev.y + info.delta.y,
        }));
      }
    },
    [isZoomed]
  );

  // Reset zoom when image changes
  useEffect(() => {
    setIsImageLoaded(false);
    resetZoom();
  }, [selectedIndex, resetZoom]);

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
        hideCloseButton
      >
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
        >
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
                  variants={isZoomed ? undefined : variants}
                  initial={isZoomed ? false : "enter"}
                  animate={isZoomed ? false : "center"}
                  exit={isZoomed ? undefined : "exit"}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag={isZoomed ? "x" : "x"}
                  dragConstraints={isZoomed ? undefined : { left: 0, right: 0 }}
                  dragElastic={isZoomed ? 0 : 0.2}
                  onDragEnd={isZoomed ? undefined : handleDragEnd}
                  onPan={isZoomed ? handlePan : undefined}
                  className={cn(
                    "cursor-grab active:cursor-grabbing",
                    isZoomed && "cursor-move"
                  )}
                  style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transformOrigin: 'center center',
                  }}
                  onDoubleClick={handleDoubleTap}
                >
                  <img
                    src={images[selectedIndex].url}
                    alt={`${altPrefix} - Photo ${selectedIndex + 1}`}
                    className={cn(
                      "max-w-full max-h-[90vh] object-contain select-none transition-opacity duration-300",
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsImageLoaded(true)}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Zoom Controls - visible on all devices */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={handleZoomOut}
                  disabled={scale <= MIN_SCALE}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={handleZoomIn}
                  disabled={scale >= MAX_SCALE}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Buttons - hidden on mobile */}
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background hidden md:flex",
                  isZoomed && "opacity-50"
                )}
                onClick={handlePrevious}
                disabled={isZoomed}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background hidden md:flex",
                  isZoomed && "opacity-50"
                )}
                onClick={handleNext}
                disabled={isZoomed}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background z-10"
                onClick={isZoomed ? resetZoom : onClose}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image Counter & hints */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="bg-background/80 px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {images.length}
                  {isZoomed && ` • ${Math.round(scale * 100)}%`}
                </div>
                <span className="text-xs text-muted-foreground md:hidden">
                  {isZoomed ? "Pinch to zoom • Double-tap to reset" : "Pinch to zoom • Swipe to navigate"}
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
