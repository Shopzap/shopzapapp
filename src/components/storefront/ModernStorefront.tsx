
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModernStorefrontHeader from './ModernStorefrontHeader';
import ModernProductCard from './ModernProductCard';
import ProductGridSkeleton from './ProductGridSkeleton';
import OptimizedImage from './StoreImageOptimizer';
import { useCart } from '@/hooks/useCart';
import { Tables } from '@/integrations/supabase/types';

interface ModernStorefrontProps {
  store: any;
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const ModernStorefront: React.FC<ModernStorefrontProps> = ({ 
  store, 
  products, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { storeName } = useParams<{ storeName: string }>();
  const { getItemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const handleCartClick = () => {
    // Use the original storeName from URL params to maintain consistency
    navigate(`/store/${storeName}/cart`);
  };

  const totalItems = getItemCount();
  
  // Extract colors from theme with fallbacks
  const theme = store.theme || {};
  const primaryColor = theme.primaryColor || store.primaryColor || '#6c5ce7';
  const buttonColor = theme.buttonColor || store.buttonColor || '#6c5ce7';
  const buttonTextColor = theme.buttonTextColor || store.buttonTextColor || '#FFFFFF';
  const fontFamily = store.font_style || theme.font_style || 'Poppins';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernStorefrontHeader store={store} />
        <div className="container mx-auto px-4 py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ fontFamily }}
    >
      <ModernStorefrontHeader store={store} />
      
      {/* Hero Banner */}
      {store.banner_image && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <OptimizedImage
            src={store.banner_image}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
            loading="eager"
            width={1200}
            height={400}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{store.name}</h1>
              {store.tagline && (
                <p className="text-lg md:text-xl opacity-90">{store.tagline}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleCartClick}
              className="relative flex items-center gap-2"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No products found' : 'No products available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Check back later for new products'
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <ModernProductCard
                key={product.id}
                product={product}
                storeName={storeName || store.name}
                buttonColor={buttonColor}
                buttonTextColor={buttonTextColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernStorefront;
