
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import { generateProductSlug } from '@/utils/subdomainUtils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface SubdomainProductCardProps {
  product: Tables<'products'>;
  store: Tables<'stores'>;
}

const SubdomainProductCard: React.FC<SubdomainProductCardProps> = ({ 
  product, 
  store 
}) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const productSlug = generateProductSlug(product.name);
  const imageUrl = product.image_url || '/placeholder.svg';
  const price = Number(product.price) || 0;
  
  // Check if product is featured
  const isFeatured = product.description?.includes('featured') || false;
  
  // Mock inventory check - you can replace with actual inventory logic
  const isOutOfStock = false; // product.inventory_count === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    
    if (isOutOfStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: price,
        image_url: imageUrl,
        store_id: product.store_id,
        description: product.description,
        status: product.status,
        is_published: product.is_published,
        payment_method: product.payment_method,
        created_at: product.created_at,
        updated_at: product.updated_at,
        user_id: product.user_id
      }, 1);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group relative">
      {isFeatured && (
        <Badge className="absolute top-2 left-2 z-10 bg-yellow-500 text-yellow-900">
          Featured
        </Badge>
      )}
      
      {isOutOfStock && (
        <Badge className="absolute top-2 right-2 z-10 bg-red-500 text-white">
          Out of Stock
        </Badge>
      )}
      
      <Link to={`/${productSlug}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/${productSlug}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description.replace(/featured/gi, '').trim()}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">
            ₹{price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/${productSlug}`}>View Details</Link>
          </Button>
          
          <Button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubdomainProductCard;
