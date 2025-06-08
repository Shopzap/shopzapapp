
import React, { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Upload, X } from 'lucide-react';

const AboutPageManager = () => {
  const { storeId, storeData } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !storeId) return;

    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `about-${storeId}-${Date.now()}.${fileExt}`;
      const filePath = `${storeId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('store_logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image');
        return;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('store_logos')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        setAboutData(prev => ({
          ...prev,
          profile_image_url: publicUrlData.publicUrl
        }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Exception uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = async () => {
    if (!aboutData.profile_image_url) return;

    try {
      // Extract file path from URL for deletion
      const urlParts = aboutData.profile_image_url.split('/');
      const storeIndex = urlParts.findIndex(part => part === storeId);
      
      if (storeIndex !== -1) {
        const filePath = urlParts.slice(storeIndex).join('/');
        
        // Delete from storage
        await supabase.storage
          .from('store_logos')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    // Update local state
    setAboutData(prev => ({
      ...prev,
      profile_image_url: ''
    }));
    toast.success('Image removed successfully!');
  };

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
        <Label htmlFor="profile_image">Profile Image</Label>
        <div className="space-y-4">
          {aboutData.profile_image_url ? (
            <div className="relative inline-block">
              <img
                src={aboutData.profile_image_url}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
          
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading}
                className="cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>
            </Label>
          </div>
        </div>
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
