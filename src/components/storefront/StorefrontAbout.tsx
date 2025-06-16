
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Calendar, Store } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface StorefrontAboutProps {
  store: Tables<'stores'>;
}

const StorefrontAbout: React.FC<StorefrontAboutProps> = ({ store }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {store.logo_image && (
              <img
                src={store.logo_image}
                alt={`${store.name} logo`}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
              {store.tagline && (
                <p className="text-lg text-muted-foreground mb-3">{store.tagline}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {store.plan === 'free' ? 'Free Plan' : 'Premium Store'}
                </Badge>
                {store.created_at && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Since {formatDate(store.created_at)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Banner */}
      {store.banner_image && (
        <Card>
          <CardContent className="p-0">
            <img
              src={store.banner_image}
              alt={`${store.name} banner`}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* About Description */}
      {(store.description || store.about_description) && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">About Us</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {store.about_description || store.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mission & Vision */}
      {(store.mission_statement || store.vision_statement || store.founding_story) && (
        <div className="grid gap-6 md:grid-cols-2">
          {store.mission_statement && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {store.mission_statement}
                </p>
              </CardContent>
            </Card>
          )}
          
          {store.vision_statement && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {store.vision_statement}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Founding Story */}
      {store.founding_story && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {store.founding_story}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {store.business_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${store.business_email}`}
                  className="text-primary hover:underline"
                >
                  {store.business_email}
                </a>
              </div>
            )}
            
            {store.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${store.phone_number}`}
                  className="text-primary hover:underline"
                >
                  {store.phone_number}
                </a>
              </div>
            )}
            
            {store.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{store.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontAbout;
