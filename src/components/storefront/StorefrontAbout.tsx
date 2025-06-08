
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StorefrontAboutProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
    banner_image: string | null;
    description: string | null;
    business_email: string;
    phone_number: string;
    address: string | null;
    tagline: string | null;
    created_at: string | null;
    font_style?: string;
  };
}

const StorefrontAbout: React.FC<StorefrontAboutProps> = ({ store }) => {
  // Fetch about page content
  const { data: aboutPage } = useQuery({
    queryKey: ['aboutPage', store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_pages')
        .select('*')
        .eq('store_id', store.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="space-y-6">
      {/* About Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            About {store.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Image */}
          {(aboutPage?.profile_image_url || store.logo_image) && (
            <div className="flex justify-center">
              <img
                src={aboutPage?.profile_image_url || store.logo_image}
                alt={store.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          )}

          {/* About Title */}
          {aboutPage?.title && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{aboutPage.title}</h3>
            </div>
          )}

          {/* Bio/Description */}
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {aboutPage?.bio || store.description || `Welcome to ${store.name}! We're passionate about bringing you the best products with exceptional service.`}
            </p>
          </div>

          {/* Established Year */}
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              Est. {formatDate(store.created_at)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-900 break-words">{store.business_email}</p>
            </div>
          </div>
          
          {store.phone_number && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{store.phone_number}</p>
              </div>
            </div>
          )}

          {store.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{store.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Hours</p>
              <p className="text-sm text-gray-900">Mon - Fri: 9AM - 6PM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Choose Us Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Why Choose Us?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Quality Products</h4>
                <p className="text-xs text-gray-600">Curated selection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Fast Delivery</h4>
                <p className="text-xs text-gray-600">Quick shipping</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">24/7 Support</h4>
                <p className="text-xs text-gray-600">Always available</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontAbout;
