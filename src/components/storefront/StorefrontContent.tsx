
import React, { useState, useMemo } from "react";
import StorefrontHeader from "./StorefrontHeader";
import ProductGrid from "./ProductGrid";
import StorefrontFilters from "./StorefrontFilters";

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
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    status: string;
    category?: string | null;
    created_at?: string;
    payment_method: string;
    store_id: string;
    updated_at: string;
    user_id: string;
  }>;
}

const StorefrontContent: React.FC<StorefrontContentProps> = ({ store, products }) => {
  console.log('StorefrontContent: Products prop received', products); // Add this line
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get available categories and max price
  const { availableCategories, maxPrice } = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
    const max = products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000;
    return { availableCategories: categories, maxPrice: max };
  }, [products]);

  // Initialize price range based on actual product prices
  React.useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0 && product.category) {
        if (!selectedCategories.includes(product.category)) {
          return false;
        }
      }
      
      return true;
    });

    // Map to the structure expected by ProductGrid (Type B from error analysis)
    const mappedProducts = filtered.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description || "", // Ensure string, not null
      image_url: p.image_url || '/placeholder.svg', // Ensure string, not null; provide placeholder
      status: p.status,
      // category is not in the target type based on error, but passing it is fine if allowed
      category: p.category || undefined,
      created_at: p.created_at || new Date(0).toISOString(), // Ensure string, not undefined
      payment_method: p.payment_method,
      store_id: p.store_id,
      updated_at: p.updated_at,
      user_id: p.user_id,
    }));

    // Sort products
    mappedProducts.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'oldest':
          // created_at is now guaranteed to be a string
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'newest':
        default:
          // created_at is now guaranteed to be a string
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return mappedProducts;
  }, [products, priceRange, selectedCategories, sortBy]);

  const handleClearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          {/* Filters Sidebar */}
          {showFilters && (
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
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or browse all products.</p>
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
