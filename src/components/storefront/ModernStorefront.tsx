
import React, { useState, useMemo } from 'react';
import { Filter, Grid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import ModernStorefrontHeader from './ModernStorefrontHeader';
import ModernProductGrid from './ModernProductGrid';
import StorefrontFilters from './StorefrontFilters';

interface ModernStorefrontProps {
  store: Tables<'stores'> & {
    primaryColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    accentColor?: string;
    theme_style?: string;
    font_style?: string;
  };
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const ModernStorefront: React.FC<ModernStorefrontProps> = ({
  store,
  products,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get available categories and max price from products
  const { availableCategories, maxPrice } = useMemo(() => {
    if (!products || products.length === 0) return { availableCategories: [], maxPrice: 10000 };
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
    const max = Math.max(...products.map(p => p.price), 10000);
    return { availableCategories: categories, maxPrice: max };
  }, [products]);

  // Initialize price range based on actual product prices
  React.useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = products.filter(product => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

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

    // Sort products
    filtered.sort((a, b) => {
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
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, priceRange, selectedCategories, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (selectedCategories.length > 0) count++;
    return count;
  }, [searchTerm, priceRange, selectedCategories, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStorefrontHeader store={store} />
      
      {/* Search and Controls */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name-asc">A to Z</SelectItem>
                  <SelectItem value="name-desc">Z to A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
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

              {/* Filters */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
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
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchTerm && (
                <Card className="px-3 py-1">
                  <span className="text-sm">Search: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </Card>
              )}
              {selectedCategories.map(category => (
                <Card key={category} className="px-3 py-1">
                  <span className="text-sm">Category: {category}</span>
                  <button 
                    onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))} 
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {filteredAndSortedProducts.length} Product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </h2>
          {filteredAndSortedProducts.length === 0 && products.length > 0 && (
            <p className="text-gray-600">No products match your current filters. Try adjusting your search criteria.</p>
          )}
        </div>

        <ModernProductGrid
          products={filteredAndSortedProducts}
          storeName={store.username || store.name}
          viewMode={viewMode}
          buttonColor={store.buttonColor}
          buttonTextColor={store.buttonTextColor}
        />
      </div>
    </div>
  );
};

export default ModernStorefront;
