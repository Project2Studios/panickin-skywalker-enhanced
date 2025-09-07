import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Expand, ZoomIn, ZoomOut, X } from 'lucide-react';

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  enableZoom?: boolean;
}

export function ProductGallery({
  images,
  productName,
  className,
  showThumbnails = true,
  autoPlay = false,
  enableZoom = true,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLImageElement>(null);

  if (!images.length) {
    return (
      <div className={cn('aspect-square bg-muted rounded-lg flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl font-bold text-muted-foreground">PS</span>
          </div>
          <p className="text-sm text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomPosition({ x: 50, y: 50 });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative"
          >
            <LazyImage
              ref={imageRef}
              src={currentImage.imageUrl}
              alt={currentImage.altText || `${productName} - Image ${currentIndex + 1}`}
              className={cn(
                'w-full h-full object-cover cursor-pointer transition-transform duration-300',
                isZoomed ? 'scale-150 cursor-zoom-out' : 'hover:scale-105 cursor-zoom-in'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              width={800}
              height={800}
              onClick={enableZoom ? toggleZoom : undefined}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZoomed(false)}
            />

            {/* Zoom Instructions */}
            {enableZoom && !isZoomed && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="bg-white/90 text-black px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Click to zoom
                </div>
              </div>
            )}

            {/* Zoom Controls */}
            {isZoomed && enableZoom && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                  }}
                  className="bg-white/90 hover:bg-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Fullscreen Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg w-full h-full max-h-screen p-0 bg-black">
            <div className="relative w-full h-full flex items-center justify-center">
              <LazyImage
                src={currentImage.imageUrl}
                alt={currentImage.altText || `${productName} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                width={1200}
                height={1200}
              />
              
              {/* Fullscreen Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                )}
                onClick={() => goToIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary shadow-lg'
                  : 'border-transparent hover:border-muted-foreground'
              )}
              onClick={() => goToIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LazyImage
                src={image.imageUrl}
                alt={image.altText || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                width={64}
                height={64}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-primary/20 border border-primary rounded-sm" />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact gallery for smaller spaces
export function CompactProductGallery({
  images,
  productName,
  className,
}: Pick<ProductGalleryProps, 'images' | 'productName' | 'className'>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={cn('aspect-square bg-muted rounded-md flex items-center justify-center', className)}>
        <span className="text-lg font-bold text-muted-foreground">PS</span>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-md bg-muted group', className)}>
      <LazyImage
        src={images[currentIndex].imageUrl}
        alt={images[currentIndex].altText || `${productName} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        width={400}
        height={400}
      />

      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>

          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}