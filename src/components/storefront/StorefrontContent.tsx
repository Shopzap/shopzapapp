
import React from "react";
import { Loader, Instagram, Facebook } from "lucide-react";
import StorefrontNavbar from "./StorefrontNavbar";
import ProductGrid from "./ProductGrid";
import StorefrontAbout from "./StorefrontAbout";
import { Tables } from "@/integrations/supabase/types";
import { COLOR_PALETTES } from "./ColorPaletteSelector";

interface StorefrontContentProps {
  store: Tables<"stores"> & {
    primaryColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    accentColor?: string;
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
  console.log('StorefrontContent: Applied customization colors:', {
    primaryColor: store?.primaryColor,
    textColor: store?.textColor,
    buttonColor: store?.buttonColor,
    buttonTextColor: store?.buttonTextColor,
    accentColor: store?.accentColor,
    fontStyle: store?.font_style
  });

  // Get theme data with proper fallbacks
  const themeColors = store.theme && typeof store.theme === 'object' ? store.theme as any : {};
  const colorPaletteId = themeColors.color_palette || 'urban-modern';
  const selectedPalette = COLOR_PALETTES.find(p => p.id === colorPaletteId) || COLOR_PALETTES[0];
  
  // Apply store font style with fallback
  const fontStyle = store.font_style || themeColors.font_style || 'Poppins';
  const fontFamily = `${fontStyle}, sans-serif`;
  
  // Use the enhanced color system from store props (already processed in Storefront.tsx)
  const primaryColor = store.primaryColor || selectedPalette.primary;
  const textColor = store.textColor || '#F9FAFB';
  const buttonColor = store.buttonColor || selectedPalette.cta;
  const buttonTextColor = store.buttonTextColor || '#FFFFFF';
  const accentColor = store.accentColor || selectedPalette.accent;

  // Social links
  const socialLinks = {
    instagram: themeColors.instagram_url || '',
    facebook: themeColors.facebook_url || '',
    whatsapp: themeColors.whatsapp_url || ''
  };

  // Load Google Font dynamically
  React.useEffect(() => {
    const googleFontUrl = FONT_MAP[fontStyle];
    if (googleFontUrl) {
      const existingLink = document.querySelector(`link[href*="${googleFontUrl.split('?')[0]}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${googleFontUrl}&display=swap`;
        link.rel = 'stylesheet';
        link.onload = () => console.log(`Font loaded: ${fontStyle}`);
        link.onerror = () => console.warn(`Failed to load font: ${fontStyle}`);
        document.head.appendChild(link);
      }
    }
  }, [fontStyle]);

  console.log('StorefrontContent: Final applied colors:', { 
    primaryColor, 
    textColor, 
    buttonColor, 
    buttonTextColor, 
    accentColor,
    fontFamily 
  });

  return (
    <div 
      className="min-h-screen"
      style={{
        fontFamily,
        backgroundColor: accentColor,
        '--primary-color': primaryColor,
        '--text-color': textColor,
        '--button-color': buttonColor,
        '--button-text-color': buttonTextColor,
        '--accent-color': accentColor,
        color: textColor
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
                    className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: buttonTextColor
                    }}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: textColor }}>
                    {store.name}
                  </h1>
                  {store.tagline && (
                    <p className="text-lg mb-4" style={{ color: textColor, opacity: 0.8 }}>{store.tagline}</p>
                  )}
                  {store.description && (
                    <div 
                      className="p-4 rounded-lg max-w-2xl"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <p style={{ color: buttonTextColor }}>{store.description}</p>
                    </div>
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
              <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Products</h2>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="h-8 w-8 animate-spin" style={{ color: buttonColor }} />
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
      <footer className="border-t border-gray-200 mt-16" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="font-bold text-lg" style={{ color: buttonTextColor }}>{store.name}</h3>
              <p style={{ color: buttonTextColor, opacity: 0.8 }}>Powered by ShopZap</p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: buttonTextColor }}
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: buttonTextColor }}
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
