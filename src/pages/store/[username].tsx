
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SellerProfile {
  id: string;
  business_name: string;
  business_description?: string;
  contact_email?: string;
  contact_phone?: string;
  avatar_url?: string;
  banner_url?: string;
  is_verified: boolean;
  social_links?: any;
  return_policy?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  status: string;
}

const PublicStorefront = () => {
  const { username } = useParams<{ username: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!username) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch seller profile by username (assuming username matches business_name for now)
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_profiles')
          .select('*')
          .ilike('business_name', username)
          .eq('is_onboarding_complete', true)
          .maybeSingle();

        if (sellerError || !sellerData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setSeller(sellerData);

        // Fetch products for this seller
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerData.user_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching store data:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store "{username}" doesn't exist or is not available.</p>
          <Link to="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {seller.avatar_url && (
              <img
                src={seller.avatar_url}
                alt={seller.business_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{seller.business_name}</h1>
                {seller.is_verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
              </div>
              {seller.business_description && (
                <p className="text-gray-600 mb-4">{seller.business_description}</p>
              )}
              
              <div className="flex gap-4">
                {seller.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {seller.contact_email}
                  </div>
                )}
                {seller.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {seller.contact_phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-lg font-bold text-primary">₹{product.price}</p>
                  <Link to={`/checkout/${product.id}`} className="block mt-3">
                    <Button className="w-full" size="sm">
                      Buy Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trust Section */}
      {seller.return_policy && (
        <div className="bg-white border-t">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h3 className="font-semibold mb-2">Return Policy</h3>
            <p className="text-sm text-gray-600">{seller.return_policy}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicStorefront;
