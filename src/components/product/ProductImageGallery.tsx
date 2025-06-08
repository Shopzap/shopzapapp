
import React from 'react';

interface ProductImageGalleryProps {
  imageUrl: string | null;
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  imageUrl,
  productName,
}) => {
  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-lg overflow-hidden bg-white">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnail images would go here if available */}
    </div>
  );
};

export default ProductImageGallery;
