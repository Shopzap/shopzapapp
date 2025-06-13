
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Save } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

const CustomizeStore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_image: '',
    logo_url: '',
    primary_color: '#6c5ce7'
  });

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (storeError || !storeData) {
          toast({
            title: "Store not found",
            description: "Please complete seller onboarding first",
            variant: "destructive"
          });
          navigate('/onboarding');
          return;
        }
        
        setStoreData(storeData);
        setFormData({
          name: storeData.name || '',
          description: storeData.description || '',
          banner_image: storeData.banner_image || '',
          logo_url: storeData.logo_url || '',
          primary_color: storeData.primary_color || '#6c5ce7'
        });
        
      } catch (error) {
        console.error("Error fetching store data:", error);
        toast({
          title: "Error loading store",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreData();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!storeData) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          description: formData.description,
          banner_image: formData.banner_image,
          logo_url: formData.logo_url,
          primary_color: formData.primary_color
        })
        .eq('id', storeData.id);

      if (error) throw error;

      toast({
        title: "Store updated",
        description: "Your store customization has been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating store:", error);
      toast({
        title: "Error saving changes",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading store settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container p-4 mx-auto space-y-6 max-w-4xl">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Customize Store</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Store Branding</CardTitle>
            <CardDescription>
              Customize how your store looks and feels to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your store name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#6c5ce7"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your store is about..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="banner_image">Banner Image URL</Label>
              <Input
                id="banner_image"
                value={formData.banner_image}
                onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            
            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CustomizeStore;
