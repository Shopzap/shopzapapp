
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingCart, Share2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { parseProductSlug } from '@/utils/subdomainUtils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/NotFound';

interface SubdomainProductPageProps {
  store: Tables<'stores'>;
  products: Tables<'products'>[];
}

const SubdomainProductPage: React.FC<SubdomainProductPageProps> = ({ 
  store, 
  products 
}) => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { addToCart, getItemCount } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  // Find product by slug
  const product = products.find(p => {
    const productName = p.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    return productName === productSlug;
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const imageUrl = product.image_url || '/placeholder.svg';
  const cartItemCount = getItemCount();
  
  // Mock inventory check
  const isOutOfStock = false; // product.inventory_count === 0

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <title>{product.name} - {store.name} | ShopZap</title>
        <meta name="description" content={`${product.description} - Buy now from ${store.name} on ShopZap.`} />
        <meta property="og:title" content={`${product.name} - ${store.name}`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:description" content={product.description || ''} />
        <meta property="og:url" content={window.location.href} />
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              <div className="flex items-center space-x-3">
                {store.logo_image && (
                  <img 
                    src={store.logo_image} 
                    alt={store.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <span className="font-semibold text-gray-900">{store.name}</span>
              </div>
            </div>

            <Link 
              to="/cart" 
              className="relative flex items-center text-gray-700 hover:text-gray-900"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-blue-600">₹{price.toFixed(2)}</p>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description.replace(/featured/gi, '').trim()}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1"
                  size="lg"
                >
                  {isOutOfStock ? 'Out of Stock' : `Add to Cart - ₹${(price * quantity).toFixed(2)}`}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  size="lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Store Info */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-2">Sold by {store.name}</h4>
              {store.business_email && (
                <p className="text-sm text-gray-600">Contact: {store.business_email}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdomainProductPage;
