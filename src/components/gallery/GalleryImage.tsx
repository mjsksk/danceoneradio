import { useState, useRef, useEffect } from "react";
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
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before visible
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg card-cyber hover:shadow-glow-cyber transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {/* Skeleton placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-muted animate-pulse transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-64 object-cover transition-all duration-300 group-hover:scale-110",
            explicit ? "blur-xl" : "",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
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
