import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Palette, FileText, Type, ExternalLink } from "lucide-react";
import FontStyleSelector from "@/components/storefront/FontStyleSelector";
import AboutPageManager from "@/components/storefront/AboutPageManager";

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

const CustomizeStore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFont, setSelectedFont] = useState('Poppins');

  const { data: store, isLoading } = useQuery({
    queryKey: ['userStore', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagline: '',
    logo_image: '',
    banner_image: '',
    font_style: 'Poppins',
    theme: {}
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        tagline: store.tagline || '',
        logo_image: store.logo_image || '',
        banner_image: store.banner_image || '',
        font_style: store.font_style || 'Poppins',
        theme: store.theme || {}
      });
      setSelectedFont(store.font_style || 'Poppins');
    }
  }, [store]);

  const updateStoreMutation = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      if (!store?.id) throw new Error('No store found');
      
      console.log('Saving store updates:', updates);
      
      const { data, error } = await supabase
        .from('stores')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating store:', error);
        throw error;
      }
      
      console.log('Store updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Store Updated Successfully!",
        description: "Your changes have been saved and will appear on your live store.",
      });
      
      // Invalidate queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: ['userStore', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['store-by-name'] });
      
      // Force refresh any cached store data
      if (store?.name) {
        queryClient.invalidateQueries({ queryKey: ['store-by-name', store.name] });
      }
    },
    onError: (error) => {
      console.error('Error updating store:', error);
      toast({
        title: "Error",
        description: "Failed to update store. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      font_style: selectedFont
    };
    console.log('Submitting form data:', updatedData);
    updateStoreMutation.mutate(updatedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFontSave = () => {
    console.log('Saving font style:', selectedFont);
    updateStoreMutation.mutate({ 
      font_style: selectedFont,
      theme: {
        ...formData.theme,
        font_style: selectedFont
      }
    });
  };

  const openLiveStore = () => {
    if (store?.name) {
      const storeUrl = `/store/${encodeURIComponent(store.name)}`;
      window.open(storeUrl, '_blank');
    }
  };

  // Load Google Font dynamically for preview
  React.useEffect(() => {
    const googleFontUrl = FONT_MAP[selectedFont];
    if (googleFontUrl) {
      const existingLink = document.querySelector(`link[href*="${googleFontUrl}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${googleFontUrl}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [selectedFont]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Store Found</h2>
          <p className="text-gray-600">Please create a store first to customize it.</p>
        </div>
      </div>
    );
  }

  // Apply selected font for live preview
  const fontFamily = `${selectedFont}, sans-serif`;

  return (
    <div className="space-y-6" style={{ fontFamily }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily }}>Customize Store</h1>
          <p className="text-gray-600 mt-2" style={{ fontFamily }}>Personalize your store's appearance and content</p>
        </div>
        <Button 
          onClick={openLiveStore}
          variant="outline"
          className="flex items-center gap-2"
          style={{ fontFamily }}
        >
          <ExternalLink className="w-4 h-4" />
          View Live Store
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Fonts</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>About Page</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Store Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Store Name"
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="A catchy tagline for your store"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe what your store is about..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateStoreMutation.isPending}
                  className="w-full"
                >
                  {updateStoreMutation.isPending ? 'Saving...' : 'Save Basic Info'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily }}>Font Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FontStyleSelector 
                  value={selectedFont}
                  onChange={setSelectedFont}
                />
                
                <Button
                  onClick={handleFontSave}
                  disabled={updateStoreMutation.isPending}
                  className="w-full"
                  style={{ fontFamily }}
                >
                  {updateStoreMutation.isPending ? 'Saving...' : 'Save Font Style'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Page</CardTitle>
            </CardHeader>
            <CardContent>
              <AboutPageManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily }}>Store Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg bg-white" style={{ fontFamily }}>
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily }}>
                      {formData.name || 'Your Store Name'}
                    </h2>
                    {formData.tagline && (
                      <p className="text-lg text-gray-600 mt-2" style={{ fontFamily }}>{formData.tagline}</p>
                    )}
                  </div>
                  
                  {formData.description && (
                    <div className="mt-6">
                      <p className="text-gray-700" style={{ fontFamily }}>{formData.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily }}>Sample Product</h3>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900" style={{ fontFamily }}>Product Name</h4>
                      <p className="text-gray-600 text-sm mt-1" style={{ fontFamily }}>This is how product descriptions will look.</p>
                      <p className="text-lg font-bold text-gray-900 mt-2" style={{ fontFamily }}>₹999</p>
                      <button 
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                        style={{ fontFamily }}
                      >
                        Add to Cart
                      </button>
                    </div>
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
