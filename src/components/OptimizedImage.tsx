import { useState, useRef, useEffect } from 'react';
import { getResponsive, DEFAULT_SIZES } from '@/lib/responsiveImage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  onError?: () => void;
  style?: React.CSSProperties;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  fetchPriority,
  sizes,
  onError,
  style,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [onError]);

  const responsive = getResponsive(src);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        ...style
      }}
    >
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: width || '100%', height: height || '100%' }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={responsive?.srcset}
        sizes={responsive ? (sizes || DEFAULT_SIZES) : undefined}
        alt={alt}
        width={width ?? responsive?.w}
        height={height ?? responsive?.h}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        decoding="async"
        // @ts-expect-error fetchPriority is a valid attribute, types lag
        fetchpriority={fetchPriority}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain',
          ...style
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
