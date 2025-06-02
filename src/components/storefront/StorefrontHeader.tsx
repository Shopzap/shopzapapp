
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Grid, List, Filter, ShoppingCart } from 'lucide-react';

interface StorefrontHeaderProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
    banner_image: string | null;
    description: string | null;
    primary_color?: string;
    secondary_color?: string;
  };
  productCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  cartItemCount?: number;
}

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  store,
  productCount,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  cartItemCount = 0
}) => {
  const primaryColor = store.primary_color || '#1f2937';
  const secondaryColor = store.secondary_color || '#6b7280';

  return (
    <div className="bg-white">
      {/* Store Banner */}
      <div className="relative h-32 md:h-48 bg-gradient-to-r from-gray-900 to-gray-700 overflow-hidden">
        {store.banner_image && (
          <img
            src={store.banner_image}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Store Info Overlay */}
        <div className="absolute bottom-4 left-4 md:left-8 flex items-end gap-4">
          <div className="bg-white rounded-full p-1 shadow-lg">
            {store.logo_image ? (
              <img
                src={store.logo_image}
                alt={`${store.name} logo`}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-white mb-2">
            <h1 className="text-xl md:text-3xl font-bold">{store.name}</h1>
            {store.description && (
              <p className="text-sm md:text-base text-gray-200 mt-1">{store.description}</p>
            )}
          </div>
        </div>

        {/* Cart Icon */}
        <div className="absolute top-4 right-4 md:right-8">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white bg-opacity-90 hover:bg-opacity-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b bg-white px-4 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <span className="text-sm text-gray-600">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontHeader;
