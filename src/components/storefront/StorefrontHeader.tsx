
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Filter, ShoppingCart, Search, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  onSortChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  cartItemCount: number;
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
  cartItemCount,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAboutPage = location.pathname.includes('/about');
  const storeName = location.pathname.split('/store/')[1]?.split('/')[0];

  const handleAboutClick = () => {
    if (storeName) {
      navigate(`/store/${storeName}/about`);
    }
  };

  const handleHomeClick = () => {
    if (storeName) {
      navigate(`/store/${storeName}`);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Store Header */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {store.logo_image ? (
                <img
                  src={store.logo_image}
                  alt={store.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-600">
                    {store.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                {store.description && (
                  <p className="text-sm text-gray-600 mt-1">{store.description}</p>
                )}
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant={!isAboutPage ? "default" : "outline"}
                size="sm"
                onClick={handleHomeClick}
                className="hidden md:flex"
              >
                Shop
              </Button>
              <Button
                variant={isAboutPage ? "default" : "outline"}
                size="sm"
                onClick={handleAboutClick}
                className="hidden md:flex"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              
              {/* Cart Icon */}
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      {store.banner_image && !isAboutPage && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={store.banner_image}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>
      )}

      {/* Controls Bar - Only show on main store page */}
      {!isAboutPage && (
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {productCount} {productCount === 1 ? 'product' : 'products'}
                </span>
                
                {/* Search Bar */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Filter Toggle */}
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleFilters}
                  className="hidden lg:flex"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="rounded-none px-3"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="rounded-none px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorefrontHeader;
