
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { generateProductSlug } from "@/utils/subdomainUtils";
import { useCart } from "@/hooks/useCart";
import SubdomainProductCard from "./SubdomainProductCard";

interface SubdomainStoreHomeProps {
  store: Tables<'stores'>;
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const SubdomainStoreHome: React.FC<SubdomainStoreHomeProps> = ({ 
  store, 
  products, 
  isLoading = false 
}) => {
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  // Sort products with featured first
  const sortedProducts = [...products].sort((a, b) => {
    const aFeatured = a.description?.includes('featured') || false;
    const bFeatured = b.description?.includes('featured') || false;
    
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <title>{store.name} - Online Store | ShopZap</title>
        <meta name="description" content={`Shop from ${store.name}. ${store.description || 'Quality products at great prices.'} Powered by ShopZap.`} />
        <meta property="og:title" content={`${store.name} - Online Store`} />
        <meta property="og:description" content={store.description || `Shop from ${store.name} on ShopZap`} />
        <meta property="og:image" content={store.logo_image || '/placeholder.svg'} />
        <meta property="og:url" content={`https://${store.name.toLowerCase()}.shopzap.io`} />
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Store Name */}
            <div className="flex items-center space-x-3">
              {store.logo_image && (
                <img 
                  src={store.logo_image} 
                  alt={store.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                {store.tagline && (
                  <p className="text-sm text-gray-600">{store.tagline}</p>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">
                About
              </Link>
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
        </div>
      </nav>

      {/* Hero/Banner Section */}
      {store.banner_image && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={store.banner_image} 
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{store.name}</h2>
              {store.description && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
                  {store.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Products</h2>
          <p className="text-gray-600">
            {isLoading ? 'Loading products...' : `${sortedProducts.length} products available`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <User className="mx-auto h-24 w-24" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This store doesn't have any products available for purchase at the moment. 
              Please check back later for new arrivals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <SubdomainProductCard 
                key={product.id} 
                product={product}
                store={store}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} {store.name}. Powered by ShopZap.</p>
            {store.business_email && (
              <p className="mt-2">Contact: {store.business_email}</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubdomainStoreHome;
