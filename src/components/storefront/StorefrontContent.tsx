
import React, { useState, useMemo } from "react";
import StoreHeader from "./StoreHeader";
import ProductGrid from "./ProductGrid";
import StorefrontFilters from "./StorefrontFilters";
import { Tables } from "@/integrations/supabase/types";
import { AlertCircle, Package } from "lucide-react";

interface StorefrontContentProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
    banner_image: string | null;
    description: string | null;
    tagline?: string | null;
    primary_color?: string;
    secondary_color?: string;
    theme_style?: 'card' | 'list';
    font_style?: string;
  };
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const StorefrontContent: React.FC<StorefrontContentProps> = ({ 
  store, 
  products, 
  isLoading = false 
}) => {
  console.log('StorefrontContent: Rendering with store:', store?.name);
  console.log('StorefrontContent: Products received', products?.length || 0);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Safety check for store
  if (!store || !store.id || !store.name) {
    console.error('StorefrontContent: Invalid store data', store);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Store Data Error</h1>
          <p className="text-gray-600 mb-6">There was an error loading the store information.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Apply font style consistently
  const fontClass = store.font_style === 'Roboto' ? 'font-roboto' : 'font-poppins';

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Get available categories and max price
  const { availableCategories, maxPrice } = useMemo(() => {
    if (!safeProducts || safeProducts.length === 0) {
      return { availableCategories: [], maxPrice: 1000 };
    }
    
    const categories = [...new Set(safeProducts
      .map(p => p.description?.includes('Category:') ? p.description.split('Category:')[1]?.trim() : null)
      .filter(Boolean)
    )] as string[];
    
    const max = Math.max(...safeProducts.map(p => Number(p.price) || 0), 1000);
    return { availableCategories: categories, maxPrice: max };
  }, [safeProducts]);

  // Initialize price range based on actual product prices
  React.useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!safeProducts || safeProducts.length === 0) {
      return [];
    }

    let filtered = safeProducts.filter(product => {
      if (!product || !product.id || !product.name || typeof product.price === 'undefined') {
        return false;
      }

      const productPrice = Number(product.price) || 0;
      
      // Price filter
      if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
        return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        const productCategory = product.description?.includes('Category:') 
          ? product.description.split('Category:')[1]?.trim() 
          : null;
        if (!productCategory || !selectedCategories.includes(productCategory)) {
          return false;
        }
      }
      
      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price-desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [safeProducts, priceRange, selectedCategories, sortBy]);

  const handleClearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
      <StoreHeader store={store} />
      
      {/* Hero Banner */}
      {store.banner_image && (
        <div className="relative h-48 md:h-64 bg-gray-200 overflow-hidden">
          <img 
            src={store.banner_image} 
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{store.name}</h2>
              {store.description && (
                <p className="text-lg md:text-xl max-w-2xl">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store Description (if no banner) */}
      {!store.banner_image && store.description && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{store.name}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{store.description}</p>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort Controls */}
        {safeProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Filters {showFilters ? '▼' : '▶'}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                ☰
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && safeProducts.length > 0 && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <StorefrontFilters
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceChange={setPriceRange}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                availableCategories={availableCategories}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading products...</h3>
                <p className="text-gray-600">Please wait while we load the products.</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 && safeProducts.length > 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products match your filters</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your price range or categories to see more products.</p>
                    <button 
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : safeProducts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">No Products Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      This store is currently being set up and doesn't have any products available yet. 
                      Please check back soon for new arrivals!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ProductGrid products={filteredAndSortedProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {store.name}. Powered by ShopZap.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontContent;
