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
import { Upload, Palette, FileText, Type } from "lucide-react";
import FontStyleSelector from "@/components/storefront/FontStyleSelector";
import AboutPageManager from "@/components/storefront/AboutPageManager";

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
    font_style: 'Poppins'
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        tagline: store.tagline || '',
        logo_image: store.logo_image || '',
        banner_image: store.banner_image || '',
        font_style: store.font_style || 'Poppins'
      });
      setSelectedFont(store.font_style || 'Poppins');
    }
  }, [store]);

  const updateStoreMutation = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      if (!store?.id) throw new Error('No store found');
      
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Store updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['userStore', user?.id] });
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
    updateStoreMutation.mutate({
      ...formData,
      font_style: selectedFont
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return <div>Loading store data...</div>;
  }

  if (!store) {
    return <div>No store found. Please create a store first.</div>;
  }

  // Apply selected font for live preview
  const fontClass = `font-${selectedFont.toLowerCase().replace(' ', '')}`;

  return (
    <div className={`space-y-6 ${fontClass}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customize Store</h1>
        <p className="text-gray-600 mt-2">Personalize your store's appearance and content</p>
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
                  {updateStoreMutation.isPending ? 'Updating...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle>Font Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FontStyleSelector 
                  value={selectedFont}
                  onChange={setSelectedFont}
                />
                
                <Button
                  onClick={() => updateStoreMutation.mutate({ font_style: selectedFont })}
                  disabled={updateStoreMutation.isPending}
                  className="w-full"
                >
                  {updateStoreMutation.isPending ? 'Saving...' : 'Save Font Style'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <AboutPageManager storeId={store.id} />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Store Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 border rounded-lg bg-white ${fontClass}`}>
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">{formData.name || 'Your Store Name'}</h2>
                    {formData.tagline && (
                      <p className="text-lg text-gray-600 mt-2">{formData.tagline}</p>
                    )}
                  </div>
                  
                  {formData.description && (
                    <div className="mt-6">
                      <p className="text-gray-700">{formData.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Sample Product</h3>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Product Name</h4>
                      <p className="text-gray-600 text-sm mt-1">This is how product descriptions will look.</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">$29.99</p>
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
