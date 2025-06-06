
import React from "react";
import StorefrontProductCard from "./StorefrontProductCard";
import { Tables } from "@/integrations/supabase/types";
import { Package, Plus } from "lucide-react";

interface ProductGridProps {
  products: Tables<"products">[];
  viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode = 'grid' }) => {
  console.log('ProductGrid: Rendering with products:', products?.length || 0);
  console.log('ProductGrid: Product details:', products?.map(p => ({ 
    id: p.id, 
    name: p.name, 
    status: p.status, 
    is_published: p.is_published 
  })));
  
  // Handle empty products case - improved messaging for public storefront
  if (!products || products.length === 0) {
    console.log('ProductGrid: No products to display, showing empty state');
    return (
      <div className="text-center py-16 px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">No Products Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This store is currently being set up and doesn't have any products available yet. 
              Please check back soon for new arrivals!
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Store Owner?</strong> Add your first products in the dashboard to start selling!
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('ProductGrid: Displaying products in', viewMode, 'mode');

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <StorefrontProductCard key={product.id} product={product} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <StorefrontProductCard key={product.id} product={product} viewMode="grid" />
      ))}
    </div>
  );
};

export default ProductGrid;
