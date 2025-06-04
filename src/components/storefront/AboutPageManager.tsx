
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface AboutPageManagerProps {
  storeId: string;
}

const AboutPageManager: React.FC<AboutPageManagerProps> = ({ storeId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    profile_image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch existing about page data
  const { data: aboutPage, isLoading } = useQuery({
    queryKey: ['aboutPage', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_pages')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });

  // Update form data when about page data is loaded
  useEffect(() => {
    if (aboutPage) {
      setFormData({
        title: aboutPage.title || '',
        bio: aboutPage.bio || '',
        profile_image_url: aboutPage.profile_image_url || ''
      });
      setImagePreview(aboutPage.profile_image_url || '');
    }
  }, [aboutPage]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${storeId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(`about-images/${fileName}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(`about-images/${fileName}`);

    return urlData.publicUrl;
  };

  // Save about page mutation
  const saveAboutPageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.profile_image_url;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const aboutData = {
        store_id: storeId,
        title: data.title,
        bio: data.bio,
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (aboutPage) {
        // Update existing
        const { data: result, error } = await supabase
          .from('about_pages')
          .update(aboutData)
          .eq('id', aboutPage.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Create new
        const { data: result, error } = await supabase
          .from('about_pages')
          .insert(aboutData)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "About page saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['aboutPage', storeId] });
      setImageFile(null);
    },
    onError: (error) => {
      console.error('Error saving about page:', error);
      toast({
        title: "Error",
        description: "Failed to save about page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAboutPageMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return <div>Loading about page data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Page Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="About Our Store"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio/Description</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={6}
              placeholder="Tell your customers about your store, your story, and what makes you special..."
            />
          </div>

          <div>
            <Label htmlFor="profile_image">Profile Image</Label>
            <div className="mt-2 space-y-4">
              {imagePreview && (
                <div className="relative w-32 h-32">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saveAboutPageMutation.isPending}
            className="w-full"
          >
            {saveAboutPageMutation.isPending ? 'Saving...' : 'Save About Page'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AboutPageManager;
