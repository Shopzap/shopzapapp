
import React, { useState, useMemo } from "react";
import StorefrontHeader from "./StorefrontHeader";
import ProductGrid from "./ProductGrid";
import StorefrontFilters from "./StorefrontFilters";
import StorefrontNavbar from "./StorefrontNavbar";
import { Tables } from "@/integrations/supabase/types";
import { AlertCircle } from "lucide-react";

interface StorefrontContentProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
    banner_image: string | null;
    description: string | null;
    primary_color?: string;
    secondary_color?: string;
    theme_style?: 'card' | 'list';
    font_style?: string;
  };
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const StorefrontContent: React.FC<StorefrontContentProps> = ({ store, products, isLoading = false }) => {
  console.log('StorefrontContent: Products received', products);
  console.log('StorefrontContent: Products count', products?.length || 0);
  console.log('StorefrontContent: Is loading', isLoading);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Apply font style to the entire storefront
  const fontClass = store.font_style ? `font-${store.font_style.toLowerCase()}` : 'font-poppins';

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Get available categories and max price
  const { availableCategories, maxPrice } = useMemo(() => {
    if (!safeProducts || safeProducts.length === 0) {
      return { availableCategories: [], maxPrice: 1000 };
    }
    
    const categories = [...new Set(safeProducts.map(p => p.description?.includes('Category:') ? p.description.split('Category:')[1]?.trim() : null).filter(Boolean))] as string[];
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
      console.log('StorefrontContent: No products to filter');
      return [];
    }

    let filtered = safeProducts.filter(product => {
      // Ensure product has required fields
      if (!product || !product.id || !product.name || typeof product.price === 'undefined') {
        console.log('StorefrontContent: Skipping invalid product', product);
        return false;
      }

      const productPrice = Number(product.price) || 0;
      
      // Price filter
      if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
        return false;
      }
      
      // Category filter (using description field for categories)
      if (selectedCategories.length > 0) {
        const productCategory = product.description?.includes('Category:') ? product.description.split('Category:')[1]?.trim() : null;
        if (!productCategory || !selectedCategories.includes(productCategory)) {
          return false;
        }
      }
      
      return true;
    });

    console.log('StorefrontContent: Filtered products count', filtered.length);

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

  // Only show filters if there are products
  const shouldShowFilters = safeProducts.length > 0 && showFilters;

  return (
    <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
      <StorefrontNavbar storeName={store.name} />
      
      <StorefrontHeader
        store={store}
        productCount={filteredAndSortedProducts.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        cartItemCount={0}
      />

      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-8">
          {/* Filters Sidebar - Only show if there are products */}
          {shouldShowFilters && (
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
          <div className="flex-1" id="products-section">
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
            ) : (
              <ProductGrid products={filteredAndSortedProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {store.name}. Powered by ShopZap.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontContent;
