
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    images?: string[];
    inventory_count?: number;
    store_name?: string;
    payment_method?: string;
    created_at?: string;
    updated_at?: string;
  };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Product Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-muted-foreground">Product ID</span>
            <span className="text-sm font-medium">{product.id.slice(0, 8)}...</span>
          </div>
          {product.created_at && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Listed on
              </span>
              <span className="text-sm font-medium">{formatDate(product.created_at)}</span>
            </div>
          )}
          {product.updated_at && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last updated
              </span>
              <span className="text-sm font-medium">{formatDate(product.updated_at)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Payment Method</span>
            <span className="text-sm font-medium capitalize">
              {product.payment_method === 'cod' ? 'Cash on Delivery' : product.payment_method || 'COD'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfo;
