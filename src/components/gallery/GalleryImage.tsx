import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GalleryImageProps {
  src: string;
  alt: string;
  explicit?: boolean;
  onClick: () => void;
  className?: string;
}

const GalleryImage = ({ src, alt, explicit, onClick, className }: GalleryImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Stable callback for image load
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Use functional update to prevent race conditions
          setIsInView(prev => {
            if (!prev) {
              // Only set image src once when first entering view
              setImageSrc(src);
            }
            return true;
          });
          // Disconnect after triggering - prevent multiple calls
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg card-cyber hover:shadow-glow-cyber transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {/* Skeleton placeholder - stable, no flicker */}
      <div
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-500",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        style={{ minHeight: "256px" }}
      />

      {/* Actual image - only render when src is set */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-64 object-cover transition-all duration-500",
            explicit ? "blur-xl" : "",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleImageLoad}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-foreground font-semibold text-lg">
          {explicit ? "View Photo (18+)" : "View Photo"}
        </span>
      </div>
    </div>
  );
};

export default GalleryImage;
