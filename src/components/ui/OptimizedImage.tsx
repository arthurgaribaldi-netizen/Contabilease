'use client';

import { useIntersectionObserver } from '@/hooks/usePerformance';
import { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  quality = 75,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (!hasIntersected && !priority) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };

    img.src = src;
  }, [src, hasIntersected, priority, onLoad, onError]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'opacity-50' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Erro ao carregar imagem</div>
        </div>
      )}
    </div>
  );
}

// Hook para preload de imagens
export function useImagePreload() {
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = (src: string) => {
    if (preloadedImages.current.has(src)) return;

    const img = new Image();
    img.src = src;
    preloadedImages.current.add(src);
  };

  const preloadImages = (srcs: string[]) => {
    srcs.forEach(preloadImage);
  };

  return { preloadImage, preloadImages };
}

// Componente para imagens responsivas
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string;
  srcSet?: string;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  srcSet,
  ...props
}: ResponsiveImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (!hasIntersected) return;

    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.src = src;
  }, [src, hasIntersected]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
    </div>
  );
}
