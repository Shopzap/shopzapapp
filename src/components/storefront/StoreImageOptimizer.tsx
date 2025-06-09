
import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = 'https://placehold.co/400x400?text=No+Image',
  loading = 'lazy',
  width,
  height
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setImageError(true);
      setImageLoaded(true);
    }
  }, [currentSrc, fallback]);

  // Optimize Supabase image URLs by adding resize parameters
  const optimizeImageUrl = useCallback((url: string) => {
    if (!url || url.includes('placehold.co')) return url;
    
    // Add resize parameters for Supabase storage images
    if (url.includes('supabase') && width && height) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=${width}&height=${height}&resize=cover&quality=80`;
    }
    
    return url;
  }, [width, height]);

  const optimizedSrc = optimizeImageUrl(currentSrc);

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={loading}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;
