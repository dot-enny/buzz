import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
    src: string;
    alt: string;
    /** Blur hash or tiny placeholder image URL */
    placeholder?: string;
    /** Custom blur amount for placeholder (default: 20) */
    blurAmount?: number;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
    /** Called when image loads successfully */
    onLoad?: () => void;
    /** Called when image fails to load */
    onError?: () => void;
    /** Whether to use native lazy loading (default: true) */
    lazy?: boolean;
    /** Root margin for intersection observer (default: '200px') */
    rootMargin?: string;
}

/**
 * OptimizedImage - A performant image component with:
 * - Intersection Observer-based lazy loading
 * - Blur placeholder during load
 * - Smooth fade-in animation on load
 * - Error state handling
 */
export const OptimizedImage = ({
    src,
    alt,
    placeholder,
    blurAmount = 20,
    loadingComponent,
    onLoad,
    onError,
    lazy = true,
    rootMargin = '200px',
    className = '',
    style,
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isInView, setIsInView] = useState(!lazy);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin, threshold: 0 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [lazy, rootMargin, isInView]);

    // Preload image when in view
    useEffect(() => {
        if (!isInView || !src) return;

        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            setIsLoaded(true);
            setIsError(false);
            onLoad?.();
        };
        
        img.onerror = () => {
            setIsError(true);
            setIsLoaded(false);
            onError?.();
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [isInView, src, onLoad, onError]);

    // Generate a simple color placeholder if no placeholder provided
    const defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23374151" width="1" height="1"/%3E%3C/svg%3E';

    return (
        <div 
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={style}
        >
            {/* Placeholder layer */}
            {!isLoaded && !isError && (
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${placeholder || defaultPlaceholder})`,
                        filter: `blur(${blurAmount}px)`,
                        transform: 'scale(1.1)', // Prevent blur edge artifacts
                    }}
                />
            )}

            {/* Loading indicator */}
            {!isLoaded && !isError && isInView && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {loadingComponent || (
                        <div className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-300 rounded-full animate-spin" />
                    )}
                </div>
            )}

            {/* Error state */}
            {isError && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                    <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            {/* Actual image */}
            {isInView && !isError && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                </motion.div>
            )}
        </div>
    );
};

/**
 * Hook to generate a tiny blur placeholder from an image URL
 * This uses canvas to create a small, blurred version of the image
 */
export const useBlurPlaceholder = (src: string, size: number = 10) => {
    const [placeholder, setPlaceholder] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            canvas.width = size;
            canvas.height = size;
            ctx?.drawImage(img, 0, 0, size, size);
            
            try {
                setPlaceholder(canvas.toDataURL('image/jpeg', 0.1));
            } catch {
                // CORS error - use default placeholder
                setPlaceholder(null);
            }
        };

        img.src = src;

        return () => {
            img.onload = null;
        };
    }, [src, size]);

    return placeholder;
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = async (srcs: string[]): Promise<PromiseSettledResult<void>[]> => {
    return Promise.allSettled(srcs.map(preloadImage));
};

export default OptimizedImage;
