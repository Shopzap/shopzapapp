
import React from 'react';
import ModernProductCard from './ModernProductCard';
import ProductPagination from './ProductPagination';
import { Tables } from '@/integrations/supabase/types';

interface ModernProductGridProps {
  products: Tables<'products'>[];
  storeName: string;
  viewMode?: 'grid' | 'list';
  buttonColor?: string;
  buttonTextColor?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

const ModernProductGrid: React.FC<ModernProductGridProps> = ({ 
  products, 
  storeName,
  viewMode = 'grid',
  buttonColor,
  buttonTextColor,
  currentPage,
  onPageChange,
  isMobile = false
}) => {
  console.log('ModernProductGrid: Rendering with', products.length, 'products');

  // Responsive products per page - 5 on mobile, 10 on desktop
  const productsPerPage = isMobile ? 5 : 10;
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-sm mx-auto px-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 text-sm">
            This store is getting ready to launch amazing products. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="space-y-3 sm:space-y-4">
          {currentProducts.map((product) => (
            <ModernProductCard
              key={product.id}
              product={product}
              storeName={storeName}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
            />
          ))}
        </div>
        
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalProducts={products.length}
          onPageChange={onPageChange}
          productsPerPage={productsPerPage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Responsive grid - 1 column on mobile, 2 on sm, 3 on lg, 5 on xl+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {currentProducts.map((product) => (
          <ModernProductCard
            key={product.id}
            product={product}
            storeName={storeName}
            buttonColor={buttonColor}
            buttonTextColor={buttonTextColor}
          />
        ))}
      </div>
      
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={products.length}
        onPageChange={onPageChange}
        productsPerPage={productsPerPage}
      />
    </div>
  );
};

export default ModernProductGrid;
