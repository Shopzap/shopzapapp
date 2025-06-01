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
  
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Store Header - Banner, Logo, Name, Description */}
      <div
        className="w-full h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${store.banner_image || ''})` }}
      >
        <div className="absolute inset-0 bg-black/40 flex items-end p-6 text-white">
          <div className="container mx-auto flex items-end">
            <img
              src={store.logo_image || ''}
              alt={`${store.name} logo`}
              className="w-20 h-20 rounded-full border-2 border-white mr-4 object-cover"
            />
            <div className="mb-2">
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-sm md:text-base mt-1 max-w-2xl">{store.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">Our Products</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image_url || ''}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 text-sm mt-1 mb-2 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-primary font-bold mt-auto mb-3">{formatPrice(product.price)}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      className="w-full" 
                      onClick={() => handleOrderNow(product.id)}
                    >
                      Order Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleViewDetails(product.id)}
                    >
                      View Details
                    </Button>
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