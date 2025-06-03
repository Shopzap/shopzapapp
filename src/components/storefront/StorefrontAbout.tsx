
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Clock, Star } from 'lucide-react';

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
  };
}

const StorefrontAbout: React.FC<StorefrontAboutProps> = ({ store }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            {store.logo_image ? (
              <img
                src={store.logo_image}
                alt={store.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-gray-600">
                  {store.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About {store.name}</h1>
          {store.tagline && (
            <p className="text-xl text-gray-600 mb-6">{store.tagline}</p>
          )}
          <Badge variant="secondary" className="text-sm">
            <Star className="w-4 h-4 mr-1" />
            Est. {formatDate(store.created_at)}
          </Badge>
        </div>

        {/* Banner Image */}
        {store.banner_image && (
          <div className="mb-12">
            <img
              src={store.banner_image}
              alt={`${store.name} banner`}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Story Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <div className="prose prose-gray max-w-none">
                {store.description ? (
                  <p className="text-gray-600 leading-relaxed">{store.description}</p>
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to {store.name}! We're passionate about bringing you the best products 
                    with exceptional service. Our commitment to quality and customer satisfaction 
                    drives everything we do.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{store.business_email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{store.phone_number}</p>
                  </div>
                </div>

                {store.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{store.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Business Hours</p>
                    <p className="text-gray-900">Mon - Fri: 9AM - 6PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Products</h3>
                <p className="text-gray-600">We curate only the finest products for our customers.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick and reliable shipping to your doorstep.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600">Always here to help with any questions or concerns.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StorefrontAbout;
