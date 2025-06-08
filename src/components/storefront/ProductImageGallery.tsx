
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  images, 
  productName, 
  className = "" 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filter out empty images and provide fallback
  const validImages = images?.filter(img => img && img.trim() !== '') || [];
  const displayImages = validImages.length > 0 
    ? validImages 
    : ['https://placehold.co/600x600?text=No+Image'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={displayImages[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation arrows - only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail navigation - only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                currentImageIndex === index
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
