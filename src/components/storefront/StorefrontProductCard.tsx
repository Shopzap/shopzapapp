
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from 'react-router-dom';

interface StorefrontProductCardProps {
  product: Tables<"products">;
}

const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  
  // Function to navigate to product details page
  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-accent flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">No image</div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StorefrontProductCard;
