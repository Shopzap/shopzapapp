import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

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
  }>;
}

const StorefrontContent: React.FC<StorefrontContentProps> = ({ store, products }) => {
  const navigate = useNavigate();
  
  // Function to handle "Order Now" button click
  const handleOrderNow = (productId: string) => {
    navigate(`/order?productId=${productId}`);
  };
  
  // Function to navigate to product details page
  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };
  
  // Default colors if not set in store
  const primaryColor = store.primary_color || '#6c5ce7';
  const secondaryColor = store.secondary_color || '#a29bfe';
  const themeStyle = store.theme_style || 'card';
  
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Store Header - Banner, Logo, Name */}
      <div className="relative">
        <div 
          className="w-full h-40 bg-cover bg-center"
          style={{ 
            backgroundImage: store.banner_image 
              ? `url(${store.banner_image})` 
              : `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
          }}
        ></div>
        
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex flex-col items-center justify-center">
          <div className="bg-white rounded-full p-2 mb-2 shadow-md">
            {store.logo_image ? (
              <img
                src={store.logo_image}
                alt={`${store.name} logo`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-xl font-bold">
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-white drop-shadow-md">{store.name}</h1>
        </div>
      </div>

      {/* Store Description (if available) */}
      {store.description && (
        <div className="container mx-auto py-4 px-4 text-center">
          <p className="text-gray-600">{store.description}</p>
        </div>
      )}

      {/* Products Section */}
      <section className="container mx-auto py-8 px-4">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: primaryColor }}>Featured Products</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at this time.</p>
          </div>
        ) : themeStyle === 'card' ? (
          // Card Grid Layout
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-md border overflow-hidden flex flex-col h-full"
              >
                <div className="h-32 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{formatPrice(product.price)}</span>
                    <Button 
                      size="sm" 
                      className="h-6 text-xs px-2" 
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => handleOrderNow(product.id)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List Layout
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-md border overflow-hidden flex flex-row"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold" style={{ color: primaryColor }}>{formatPrice(product.price)}</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => handleOrderNow(product.id)}
                      >
                        Order Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(product.id)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-8 border-t mt-8">
        © {new Date().getFullYear()} {store.name}. Powered by ShopAi.
      </footer>
    </div>
  );
};

export default StorefrontContent;