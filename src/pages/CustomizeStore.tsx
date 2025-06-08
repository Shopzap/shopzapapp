import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader, Save } from 'lucide-react';
import ColorPaletteSelector from '@/components/storefront/ColorPaletteSelector';
import FontStyleSelector from '@/components/storefront/FontStyleSelector';

interface ThemeData {
  color_palette?: string;
  primary_color?: string;
  accent_color?: string;
  cta_color?: string;
  font_style?: string;
  instagram_url?: string;
  facebook_url?: string;
  whatsapp_url?: string;
}

const CustomizeStore: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState('urban-modern');
  const [fontStyle, setFontStyle] = useState('Poppins');
  const [customColors, setCustomColors] = useState({
    primary: '',
    accent: '',
    cta: '',
  });
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    whatsapp: '',
  });

  // Fetch store data
  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No session found');

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Set form data when store data is loaded
  useEffect(() => {
    if (store) {
      setStoreName(store.name);
      setStoreTagline(store.tagline || '');
      setStoreDescription(store.description || '');
      setLogoImage(store.logo_image || null);
      setBannerImage(store.banner_image || null);
      setFontStyle(store.font_style || 'Poppins');

      // Theme settings with proper type casting
      if (store.theme && typeof store.theme === 'object') {
        const themeData = store.theme as ThemeData;
        setSelectedPalette(themeData.color_palette || 'urban-modern');
        setCustomColors({
          primary: themeData.primary_color || '',
          accent: themeData.accent_color || '',
          cta: themeData.cta_color || '',
        });
        setSocialLinks({
          instagram: themeData.instagram_url || '',
          facebook: themeData.facebook_url || '',
          whatsapp: themeData.whatsapp_url || '',
        });
      }
    }
  }, [store]);

  const publishMutation = useMutation({
    mutationFn: async (storeData: any) => {
      console.log('Publishing store customization...', storeData);
      
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          tagline: storeData.tagline,
          description: storeData.description,
          logo_image: storeData.logo_image,
          banner_image: storeData.banner_image,
          font_style: storeData.font_style,
          theme: storeData.theme,
          updated_at: new Date().toISOString()
        })
        .eq('id', store?.id);

      if (error) throw error;
      
      return storeData;
    },
    onSuccess: (data) => {
      console.log('Store customization published successfully');
      
      // Invalidate and refetch store data to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['store'] });
      queryClient.invalidateQueries({ queryKey: ['store-by-name', data.name] });
      
      toast({
        title: "Store Published!",
        description: "Your store customization has been saved and published successfully.",
      });
    },
    onError: (error) => {
      console.error('Error publishing store:', error);
      toast({
        title: "Publishing Failed",
        description: "Failed to publish store customization. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePublish = async () => {
    if (!store) return;
    
    setIsPublishing(true);
    try {
      await publishMutation.mutateAsync({
        name: storeName,
        tagline: storeTagline,
        description: storeDescription,
        logo_image: logoImage,
        banner_image: bannerImage,
        font_style: fontStyle,
        theme: {
          color_palette: selectedPalette,
          primary_color: customColors.primary,
          accent_color: customColors.accent,
          cta_color: customColors.cta,
          font_style: fontStyle,
          instagram_url: socialLinks.instagram,
          facebook_url: socialLinks.facebook,
          whatsapp_url: socialLinks.whatsapp
        }
      });
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `logos/${store?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      setLogoImage(data.publicUrl);
    } catch (error: any) {
      toast({
        title: "Error uploading logo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `banners/${store?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      setBannerImage(data.publicUrl);
    } catch (error: any) {
      toast({
        title: "Error uploading banner",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
  };

  const handleRemoveBanner = () => {
    setBannerImage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store settings...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Store Not Found</h2>
          <p className="text-muted-foreground">Please complete the onboarding process first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customize Your Store</h1>
          <p className="text-muted-foreground mt-2">Personalize your store's appearance and content</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="store-tagline">Tagline</Label>
                <Input
                  id="store-tagline"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="store-description">Description</Label>
                <Textarea
                  id="store-description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">Logo Image</Label>
                <div className="flex items-center space-x-4">
                  {logoImage ? (
                    <div className="relative">
                      <img
                        src={logoImage}
                        alt="Logo Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-background text-muted-foreground hover:bg-secondary"
                        onClick={handleRemoveLogo}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      No Logo
                    </div>
                  )}
                  <Input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Label htmlFor="logo-upload" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-md px-4 py-2 cursor-pointer">
                    Upload Logo
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="banner-upload">Banner Image</Label>
                <div className="flex items-center space-x-4">
                  {bannerImage ? (
                    <div className="relative">
                      <img
                        src={bannerImage}
                        alt="Banner Preview"
                        className="h-20 w-40 object-cover rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-background text-muted-foreground hover:bg-secondary"
                        onClick={handleRemoveBanner}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-40 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
                      No Banner
                    </div>
                  )}
                  <Input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <Label htmlFor="banner-upload" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-md px-4 py-2 cursor-pointer">
                    Upload Banner
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPaletteSelector
                selectedPalette={selectedPalette}
                onPaletteChange={(paletteId) => setSelectedPalette(paletteId)}
              />
              <FontStyleSelector
                fontStyle={fontStyle}
                onFontChange={(font) => setFontStyle(font)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram-link">Instagram</Label>
                <Input
                  id="instagram-link"
                  type="url"
                  placeholder="https://instagram.com/yourstore"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="facebook-link">Facebook</Label>
                <Input
                  id="facebook-link"
                  type="url"
                  placeholder="https://facebook.com/yourstore"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-link">WhatsApp</Label>
                <Input
                  id="whatsapp-link"
                  type="url"
                  placeholder="https://wa.me/yournumber"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Store Preview</span>
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isPublishing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Publish Changes
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[500px]">
                {/* Store Preview */}
                <div className="bg-white">
                  {/* Banner Section */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                    {bannerImage && (
                      <img 
                        src={bannerImage} 
                        alt="Store Banner" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    
                    {/* Store Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-4">
                        {logoImage ? (
                          <img 
                            src={logoImage} 
                            alt="Store Logo" 
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-600 text-xl font-bold shadow-lg">
                            {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <div>
                          <h1 className="text-2xl font-bold" style={{ fontFamily: fontStyle }}>
                            {storeName || 'Your Store Name'}
                          </h1>
                          {storeTagline && (
                            <p className="text-sm opacity-90">{storeTagline}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Content */}
                  <div className="p-6">
                    {storeDescription && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{storeDescription}</p>
                      </div>
                    )}

                    {/* Sample Products */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: fontStyle }}>
                        Products
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="h-32 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">Product Image</span>
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium mb-1" style={{ fontFamily: fontStyle }}>
                                Sample Product {i}
                              </h3>
                              <p className="text-lg font-bold" style={{ color: customColors.primary || '#6366f1' }}>
                                $99.99
                              </p>
                              <button 
                                className="w-full mt-2 px-3 py-1 rounded text-white text-sm font-medium"
                                style={{ backgroundColor: customColors.cta || '#10b981' }}
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social Links Preview */}
                    {(socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp) && (
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-3" style={{ fontFamily: fontStyle }}>
                          Follow Us
                        </h3>
                        <div className="flex gap-3">
                          {socialLinks.instagram && (
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                              IG
                            </div>
                          )}
                          {socialLinks.facebook && (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                              FB
                            </div>
                          )}
                          {socialLinks.whatsapp && (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                              WA
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizeStore;
