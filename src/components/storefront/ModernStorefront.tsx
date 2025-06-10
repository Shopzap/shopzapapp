
import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import ModernStorefrontHeader from './ModernStorefrontHeader';
import ModernProductGrid from './ModernProductGrid';
import CTAButtons from './CTAButtons';

interface ModernStorefrontProps {
  store: Tables<'stores'> & {
    primaryColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    accentColor?: string;
    theme?: any;
  };
  products: Tables<'products'>[];
  isLoading?: boolean;
}

const ModernStorefront: React.FC<ModernStorefrontProps> = ({ 
  store, 
  products, 
  isLoading 
}) => {
  const theme = store.theme || {};
  const storeSlug = store.slug || store.username || store.name;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: store.primaryColor || '#1F2937',
        color: store.textColor || '#F9FAFB'
      }}
    >
      {/* Header */}
      <ModernStorefrontHeader store={store} />
      
      {/* Main Content */}
      <main className="relative">
        {/* Store Info Section */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Store Description */}
            {store.description && (
              <div className="mb-8">
                <div className="max-w-4xl mx-auto text-center">
                  <p 
                    className="text-lg sm:text-xl leading-relaxed px-4"
                    style={{ color: store.textColor || '#F9FAFB' }}
                  >
                    {store.description}
                  </p>
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 
                  className="text-2xl sm:text-3xl font-bold mb-4"
                  style={{ color: store.textColor || '#F9FAFB' }}
                >
                  Our Products
                </h2>
                {products.length > 0 && (
                  <p 
                    className="text-sm sm:text-base opacity-80"
                    style={{ color: store.textColor || '#F9FAFB' }}
                  >
                    Discover our collection of {products.length} amazing products
                  </p>
                )}
              </div>
              
              {products.length > 0 ? (
                <ModernProductGrid 
                  products={products} 
                  storeName={storeSlug}
                  buttonColor={store.buttonColor}
                  buttonTextColor={store.buttonTextColor}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto px-4">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: store.accentColor || '#6B7280' }}
                    >
                      <svg 
                        className="w-8 h-8" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: store.textColor || '#F9FAFB' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h6M9 9l-2-2m2 2l-2 2M9 9v2m6-2h2M15 9l2-2m-2 2l2 2M15 9v2" />
                      </svg>
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: store.textColor || '#F9FAFB' }}
                    >
                      No Products Yet
                    </h3>
                    <p 
                      className="text-sm opacity-80"
                      style={{ color: store.textColor || '#F9FAFB' }}
                    >
                      This store is being set up. Check back soon for amazing products!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="space-y-4">
                <h3 
                  className="text-xl font-semibold"
                  style={{ color: store.textColor || '#F9FAFB' }}
                >
                  Ready to Shop?
                </h3>
                <p 
                  className="text-sm opacity-80 mb-4"
                  style={{ color: store.textColor || '#F9FAFB' }}
                >
                  Contact us on WhatsApp to place your order
                </p>
                <a
                  href={`https://wa.me/${store.phone_number?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: store.buttonColor || '#10B981',
                    color: store.buttonTextColor || '#FFFFFF'
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.085"/>
                  </svg>
                  Shop on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="border-t py-8 px-4 sm:px-6 lg:px-8"
        style={{ 
          borderTopColor: store.accentColor || '#374151',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p 
              className="text-sm opacity-80 mb-4"
              style={{ color: store.textColor || '#F9FAFB' }}
            >
              © 2024 {store.name}. All rights reserved.
            </p>
            
            {/* Social Links */}
            {(theme.instagram_url || theme.facebook_url || theme.whatsapp_url) && (
              <div className="flex justify-center space-x-6">
                {theme.instagram_url && (
                  <a 
                    href={theme.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: store.textColor || '#F9FAFB' }}
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.864 3.708 13.713 3.708 12.416s.49-2.448 1.297-3.323C5.832 8.215 6.983 7.725 8.28 7.725s2.448.49 3.323 1.297c.807.827 1.297 1.978 1.297 3.275s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                    </svg>
                  </a>
                )}
                
                {theme.facebook_url && (
                  <a 
                    href={theme.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: store.textColor || '#F9FAFB' }}
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                
                {theme.whatsapp_url && (
                  <a 
                    href={theme.whatsapp_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: store.textColor || '#F9FAFB' }}
                  >
                    <span className="sr-only">WhatsApp</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.085"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t" style={{ borderTopColor: store.accentColor || '#374151' }}>
              <p 
                className="text-xs opacity-60"
                style={{ color: store.textColor || '#F9FAFB' }}
              >
                Powered by <span className="font-semibold">ShopZap.io</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernStorefront;
