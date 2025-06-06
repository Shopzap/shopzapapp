
import React, { useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ 
  images, 
  productName 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Handle empty images array or fallback
  const displayImages = images && images.length > 0 
    ? images.filter(img => img && img.trim() !== '') 
    : ['https://placehold.co/600x600?text=No+Image'];

  const currentImage = displayImages[selectedImageIndex] || displayImages[0];

  if (displayImages.length === 1) {
    return (
      <div className="w-full">
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
        <img
          src={currentImage}
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Navigation */}
      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {displayImages.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/4 md:basis-1/5">
                <Button
                  variant="ghost"
                  className={`p-0 h-auto aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          {displayImages.length > 4 && (
            <>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </>
          )}
        </Carousel>
      </div>

      {/* Mobile Swipe Indicator */}
      {displayImages.length > 1 && (
        <div className="flex justify-center space-x-2 md:hidden">
          {displayImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                selectedImageIndex === index ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
