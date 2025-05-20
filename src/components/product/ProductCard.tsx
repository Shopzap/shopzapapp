
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card key={product.id} className="overflow-hidden">
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
        <Badge 
          className="absolute top-2 right-2"
          variant={product.status === 'active' ? 'default' : 'secondary'}
        >
          {product.status === 'active' ? 'Active' : 'Draft'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{product.name}</h3>
        <p className="text-primary font-bold">{formatPrice(product.price)}</p>
        {product.category && (
          <Badge variant="outline" className="mt-2">
            {product.category}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {product.inventory_count !== undefined && (
          <span className="text-sm text-muted-foreground">
            {product.inventory_count > 0 
              ? `${product.inventory_count} in stock` 
              : 'Out of stock'}
          </span>
        )}
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
