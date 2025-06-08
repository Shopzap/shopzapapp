
import React from "react";
import { Loader, Instagram, Facebook } from "lucide-react";
import StorefrontNavbar from "./StorefrontNavbar";
import ProductGrid from "./ProductGrid";
import StorefrontAbout from "./StorefrontAbout";
import { Tables } from "@/integrations/supabase/types";

interface StorefrontContentProps {
  store: Tables<"stores"> & {
    primary_color?: string;
    secondary_color?: string;
    theme_style?: string;
    font_style?: string;
  };
  products: Tables<"products">[];
  isLoading?: boolean;
}

// Font mapping for Google Fonts
const FONT_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@300;400;500;600;700',
  'Poppins': 'Poppins:wght@300;400;500;600;700',
  'Montserrat': 'Montserrat:wght@300;400;500;600;700',
  'Lato': 'Lato:wght@300;400;700',
  'Rubik': 'Rubik:wght@300;400;500;600;700',
  'DM Sans': 'DM+Sans:wght@300;400;500;600;700',
  'Manrope': 'Manrope:wght@300;400;500;600;700',
  'Nunito': 'Nunito:wght@300;400;500;600;700',
  'Mulish': 'Mulish:wght@300;400;500;600;700',
  'Ubuntu': 'Ubuntu:wght@300;400;500;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  'Merriweather': 'Merriweather:wght@300;400;700',
  'EB Garamond': 'EB+Garamond:wght@400;500;600;700',
  'Fredoka': 'Fredoka:wght@300;400;500;600;700',
  'Pacifico': 'Pacifico',
  'Baloo 2': 'Baloo+2:wght@400;500;600;700',
};

const StorefrontContent: React.FC<StorefrontContentProps> = ({
  store,
  products,
  isLoading = false
}) => {
  console.log('StorefrontContent: Rendering with store:', store?.name);
  console.log('StorefrontContent: Store font_style:', store?.font_style);
  console.log('StorefrontContent: Store theme:', store?.theme);
  console.log('StorefrontContent: Products count:', products?.length || 0);

  const socialLinks = {
    instagram: store.theme && typeof store.theme === 'object' ? (store.theme as any).instagram_url : '',
    facebook: store.theme && typeof store.theme === 'object' ? (store.theme as any).facebook_url : '',
    whatsapp: store.theme && typeof store.theme === 'object' ? (store.theme as any).whatsapp_url : ''
  };

  // Apply store font style with fallback
  const fontStyle = store.font_style || 'Poppins';
  const fontFamily = `${fontStyle}, sans-serif`;

  // Load Google Font dynamically
  React.useEffect(() => {
    const googleFontUrl = FONT_MAP[fontStyle];
    if (googleFontUrl) {
      const existingLink = document.querySelector(`link[href*="${googleFontUrl}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${googleFontUrl}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [fontStyle]);

  // Apply theme colors
  const themeColors = store.theme && typeof store.theme === 'object' ? store.theme as any : {};
  const primaryColor = themeColors.primary_color || store.primary_color || '#6c5ce7';
  const secondaryColor = themeColors.secondary_color || store.secondary_color || '#f1c40f';

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily,
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
      } as React.CSSProperties}
    >
      {/* Navigation Bar */}
      <StorefrontNavbar 
        storeName={store.name} 
        socialLinks={socialLinks}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Products Section */}
          <div className="lg:col-span-3">
            {/* Store Header */}
            <div className="mb-8 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                {store.logo_image ? (
                  <img 
                    src={store.logo_image} 
                    alt={store.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: primaryColor, fontFamily }}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily }}>
                    {store.name}
                  </h1>
                  {store.tagline && (
                    <p className="text-lg text-gray-600 mb-4" style={{ fontFamily }}>{store.tagline}</p>
                  )}
                  {store.description && (
                    <p className="text-gray-700 max-w-2xl" style={{ fontFamily }}>{store.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Image */}
            {store.banner_image && (
              <div className="mb-8">
                <img 
                  src={store.banner_image} 
                  alt={`${store.name} banner`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Products Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily }}>Products</h2>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>

          {/* Sidebar - About Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <StorefrontAbout store={store} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Social Links */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="font-bold text-lg" style={{ fontFamily }}>{store.name}</h3>
              <p className="text-gray-600" style={{ fontFamily }}>Powered by ShopZap</p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontContent;
