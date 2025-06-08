
import React, { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const AboutPageManager = () => {
  const { storeId, storeData } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aboutData, setAboutData] = useState({
    title: '',
    bio: '',
    profile_image_url: ''
  });

  // Load existing about page data
  useEffect(() => {
    const loadAboutData = async () => {
      if (!storeId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('about_pages')
          .select('*')
          .eq('store_id', storeId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading about data:', error);
          toast.error('Failed to load about page data');
          return;
        }

        if (data) {
          setAboutData({
            title: data.title || '',
            bio: data.bio || '',
            profile_image_url: data.profile_image_url || ''
          });
        }
      } catch (error) {
        console.error('Exception loading about data:', error);
        toast.error('Failed to load about page data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAboutData();
  }, [storeId]);

  // Save about page data
  const handleSave = async () => {
    if (!storeId) {
      toast.error('No store selected');
      return;
    }

    setIsSaving(true);
    try {
      // First check if about page exists
      const { data: existingData } = await supabase
        .from('about_pages')
        .select('id')
        .eq('store_id', storeId)
        .maybeSingle();

      let result;
      if (existingData) {
        // Update existing about page
        result = await supabase
          .from('about_pages')
          .update({
            title: aboutData.title,
            bio: aboutData.bio,
            profile_image_url: aboutData.profile_image_url,
            updated_at: new Date().toISOString()
          })
          .eq('store_id', storeId)
          .eq('id', existingData.id);
      } else {
        // Create new about page
        result = await supabase
          .from('about_pages')
          .insert({
            store_id: storeId,
            title: aboutData.title,
            bio: aboutData.bio,
            profile_image_url: aboutData.profile_image_url
          });
      }

      if (result.error) {
        console.error('Database error:', result.error);
        toast.error(`Failed to save: ${result.error.message}`);
        return;
      }

      toast.success('About page saved successfully!');
    } catch (error) {
      console.error('Exception saving about data:', error);
      toast.error('Failed to save about page');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Store Title</Label>
        <Input
          id="title"
          value={aboutData.title}
          onChange={(e) => setAboutData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter your store title"
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio/Description</Label>
        <Textarea
          id="bio"
          value={aboutData.bio}
          onChange={(e) => setAboutData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell customers about your store..."
          rows={6}
        />
      </div>

      <div>
        <Label htmlFor="profile_image">Profile Image URL</Label>
        <Input
          id="profile_image"
          value={aboutData.profile_image_url}
          onChange={(e) => setAboutData(prev => ({ ...prev, profile_image_url: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save About Page
          </>
        )}
      </Button>
    </div>
  );
};

export default AboutPageManager;
