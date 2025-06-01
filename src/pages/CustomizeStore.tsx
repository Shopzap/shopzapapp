import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HexColorPicker } from 'react-colorful';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Database } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl: string;
}

const FakeProductCard: React.FC<ProductCardProps> = ({ name, price, imageUrl }) => (
  <Card className="w-full max-w-[200px] p-2 flex flex-col items-center text-center">
    <img src={imageUrl} alt={name} className="w-full h-24 object-cover mb-2 rounded" />
    <h4 className="font-semibold text-sm truncate w-full">{name}</h4>
    <p className="text-sm text-muted-foreground">{price}</p>
  </Card>
);

interface ProductListProps {
  name: string;
  price: string;
  imageUrl: string;
  description: string;
}

const FakeProductList: React.FC<ProductListProps> = ({ name, price, imageUrl, description }) => (
  <Card className="w-full p-3 flex items-center space-x-3">
    <img src={imageUrl} alt={name} className="w-16 h-16 object-cover rounded" />
    <div className="flex-1">
      <h4 className="font-semibold text-base">{name} - {price}</h4>
      <p className="text-sm text-muted-foreground truncate">{description}</p>
    </div>
  </Card>
);

const CustomizeStore: React.FC = () => {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('My Awesome Store');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#6c5ce7');
  const [secondaryColor, setSecondaryColor] = useState('#f1c40f');
  const [themeStyle, setThemeStyle] = useState<'card' | 'list'>('card');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const fetchStoreData = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching store data:', error.message);
      } else if (data) {
        setStoreId(data.id);
        setStoreName(data.name);
        setLogoUrl(data.logo_image);
        setLogo(data.logo_image); // For displaying the logo if already set
        setBannerUrl(data.banner_image); // Set banner URL from database
        if (data.theme) {
          const theme = data.theme as { primary_color?: string; secondary_color?: string; theme_layout?: 'card' | 'list' };
          setPrimaryColor(theme.primary_color || '#6c5ce7');
          setSecondaryColor(theme.secondary_color || '#f1c40f');
          setThemeStyle(theme.theme_layout || 'card');
        }
      }
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Use user.id as the folder name

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('store_logos') // Changed from 'logos' to 'store_logos'
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          return;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('store_logos') // Changed from 'logos' to 'store_logos'
          .getPublicUrl(filePath);

        if (publicUrlData) {
          setLogo(publicUrlData.publicUrl);
          setLogoUrl(publicUrlData.publicUrl);
          console.log('Logo uploaded successfully:', publicUrlData.publicUrl);
        }
      } catch (error) {
        console.error('Error in logo upload process:', error);
      }
    }
  }


  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Use user.id as the folder name

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('store_logos') // Using the same bucket as logos
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading banner:', uploadError);
          return;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('store_logos') // Using the same bucket as logos
          .getPublicUrl(filePath);

        if (publicUrlData) {
          setBannerUrl(publicUrlData.publicUrl);
          console.log('Banner uploaded successfully:', publicUrlData.publicUrl);
        }
      } catch (error) {
        console.error('Error in banner upload process:', error);
      }
    }
  }

  const handleRemoveBanner = async () => {
    if (!user || !bannerUrl) return;

    setIsSaving(true);

    try {
      // Extract the file path from the public URL
      const urlParts = bannerUrl.split('/');
      // Find the index of the user ID in the URL parts
      const userIdIndex = urlParts.findIndex(part => part === user.id);
      
      if (userIdIndex !== -1) {
        // Get the file path including user ID folder and filename
        const filePath = urlParts.slice(userIdIndex).join('/');
        
        console.log('Attempting to remove banner file:', filePath);
        
        // Delete from Supabase Storage
        const { error: deleteError } = await supabase.storage
          .from('store_logos') // Using the same bucket as logos
          .remove([filePath]);

        if (deleteError) {
          console.error('Error deleting banner from storage:', deleteError.message);
          // Even if storage deletion fails, try to update the database to clear the URL
        } else {
          console.log('Banner file successfully removed from storage');
        }
      } else {
        console.warn('Could not determine file path from URL:', bannerUrl);
      }

      // Update the database to set banner_image to null
      const { error: dbUpdateError } = await supabase
        .from('stores')
        .update({ banner_image: null })
        .eq('user_id', user.id);

      if (dbUpdateError) {
        console.error('Error updating store banner in database:', dbUpdateError.message);
      } else {
        console.log('Database updated successfully');
        setBannerUrl(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchStoreData(); // Re-fetch data to update the UI
      }
    } catch (error) {
      console.error('Error during banner removal:', error);
    } finally {
      setIsSaving(false);
    }
  }


  const handleRemoveLogo = async () => {
    if (!user || !logoUrl) return;

    setIsSaving(true);

    try {
      // Extract the file path from the public URL
      const urlParts = logoUrl.split('/');
      // Find the index of the user ID in the URL parts
      const userIdIndex = urlParts.findIndex(part => part === user.id);
      
      if (userIdIndex !== -1) {
        // Get the file path including user ID folder and filename
        const filePath = urlParts.slice(userIdIndex).join('/');
        
        console.log('Attempting to remove file:', filePath);
        
        // Delete from Supabase Storage
        const { error: deleteError } = await supabase.storage
          .from('store_logos') // Changed from 'logos' to 'store_logos'
          .remove([filePath]);

        if (deleteError) {
          console.error('Error deleting logo from storage:', deleteError.message);
          // Even if storage deletion fails, try to update the database to clear the URL
        } else {
          console.log('File successfully removed from storage');
        }
      } else {
        console.warn('Could not determine file path from URL:', logoUrl);
      }

      // Update the database to set logo_image to null
      const { error: dbUpdateError } = await supabase
        .from('stores')
        .update({ logo_image: null })
        .eq('user_id', user.id);

      if (dbUpdateError) {
        console.error('Error updating store logo in database:', dbUpdateError.message);
      } else {
        console.log('Database updated successfully');
        setLogo(null);
        setLogoUrl(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchStoreData(); // Re-fetch data to update the UI
      }
    } catch (error) {
      console.error('Error during logo removal:', error);
    } finally {
      setIsSaving(false);
    }
  }


  const handleSaveChanges = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Prepare the store data
      const storeData = {
        user_id: user.id,
        name: storeName,
        logo_image: logoUrl,
        banner_image: bannerUrl, // Add banner image URL to store data
        theme: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          theme_layout: themeStyle,
        },
        business_email: user.email || '',
        phone_number: '',
      };

      let result;

      // If we have a store ID, update the existing store
      if (storeId) {
        console.log('Updating existing store:', storeId);
        result = await supabase
          .from('stores')
          .update(storeData)
          .eq('id', storeId)
          .eq('user_id', user.id) // Ensure the user owns this store
          .select()
          .single();
      } else {
        // Otherwise, insert a new store
        console.log('Creating new store for user:', user.id);
        // For new stores, we need to set additional fields
        const newStoreData = {
          ...storeData,
          username: `${user.email?.split('@')[0]}-${crypto.randomUUID().substring(0, 6)}` || '',
          address: null,
          description: null,
          is_active: true,
          plan: 'free'
        };

        result = await supabase
          .from('stores')
          .insert([newStoreData])
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        // Handle duplicate store name error
        if (error.code === '23505') {
          console.error('Duplicate store name error:', error.message);
          alert('This store name is already taken. Please choose a different one.');
        } else {
          console.error('Error saving store data:', error);
          alert(`Error saving store data: ${error.message}`);
        }
      } else if (data) {
        console.log('Store saved successfully:', data);
        setStoreId(data.id); // Update the store ID if it was a new store
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchStoreData(); // Re-fetch data to update the UI
      } else {
        console.warn('Update successful but no data returned.');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error in save process:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fakeProducts = [
    { name: 'Wireless Earbuds', price: '$59.99', imageUrl: 'https://placehold.co/150x150/6c5ce7/ffffff?text=Product1', description: 'High-quality sound with noise cancellation.' },
    { name: 'Smartwatch', price: '$199.99', imageUrl: 'https://placehold.co/150x150/f1c40f/ffffff?text=Product2', description: 'Track your fitness and notifications.' },
    { name: 'Portable Speaker', price: '$79.99', imageUrl: 'https://placehold.co/150x150/ff6b6b/ffffff?text=Product3', description: 'Compact and powerful sound.' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customize Your Store Theme</h1>
        <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-purple-500 hover:bg-purple-600">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4 mt-4">
              <h2 className="text-lg font-semibold">Store Template</h2>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-md p-4 cursor-pointer relative ${selectedTemplate === 'modern' ? 'border-purple-500' : ''}`}
                  onClick={() => setSelectedTemplate('modern')}
                >
                  <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    {selectedTemplate === 'modern' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-center mt-2 font-medium">Modern</p>
                  {selectedTemplate === 'modern' && <p className="text-center text-xs text-purple-500">Selected</p>}
                </div>
                
                <div 
                  className={`border rounded-md p-4 cursor-pointer relative ${selectedTemplate === 'classic' ? 'border-purple-500' : ''}`}
                  onClick={() => setSelectedTemplate('classic')}
                >
                  <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    {selectedTemplate === 'classic' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-center mt-2 font-medium">Classic</p>
                  {selectedTemplate === 'classic' && <p className="text-center text-xs text-purple-500">Selected</p>}
                </div>
              </div>
              
              <div className="border border-dashed rounded-md p-6 mt-4 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 mb-2">🔒</div>
                <h3 className="font-medium">Premium Templates</h3>
                <p className="text-sm text-gray-500 mb-2">Available on Premium plan</p>
                <Button variant="outline" size="sm" className="mt-2">Upgrade to Access</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor" className="mb-1 block">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-md border cursor-pointer" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input 
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor" className="mb-1 block">Secondary Color</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-md border cursor-pointer" 
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <Input 
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4 mt-4">
              <RadioGroup value={themeStyle} onValueChange={(value: 'card' | 'list') => setThemeStyle(value)} className="space-y-4">
                <Label htmlFor="cardLayout" className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="card" id="cardLayout" />
                  <div>
                    <span className="font-medium">Card Grid Layout</span>
                    <p className="text-sm text-muted-foreground">Image + name + price in a card</p>
                  </div>
                </Label>
                <Label htmlFor="listLayout" className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="list" id="listLayout" />
                  <div>
                    <span className="font-medium">List Layout</span>
                    <p className="text-sm text-muted-foreground">Larger image with name and description in row format</p>
                  </div>
                </Label>
              </RadioGroup>
            </TabsContent>
          </Tabs>
          
          {/* Store Info Section */}
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Store Info</h2>
            <div>
              <Label htmlFor="storeName" className="mb-1 block">Store Name</Label>
              <Input
                id="storeName"
                placeholder="My Awesome Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="logoUpload" className="mb-1 block">Logo Upload</Label>
              <Input
                id="logoUpload"
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleLogoUpload}
                className="w-full"
              />
              {logoUrl && (
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <img src={logoUrl} alt="Store Logo" className="w-32 h-32 object-contain rounded-md border p-2" />
                  <Button variant="outline" onClick={handleRemoveLogo}>Remove Logo</Button>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="bannerUpload" className="mb-1 block">Banner Image Upload</Label>
              <Input
                id="bannerUpload"
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleBannerUpload}
                className="w-full"
              />
              {bannerUrl && (
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <img src={bannerUrl} alt="Store Banner" className="w-full h-32 object-cover rounded-md border p-2" />
                  <Button variant="outline" onClick={handleRemoveBanner}>Remove Banner</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Live Preview Section */}
        <div className="lg:col-span-3">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
            <div className="border rounded-md overflow-hidden">
              <div className="relative">
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}></div>
                  )}
                </div>
                
                <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex flex-col items-center justify-center">
                  <div className="bg-white rounded-full p-2 mb-2 shadow-md">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store Logo" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-xl font-bold">
                        {storeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{storeName}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-purple-700">Featured Products</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {fakeProducts.slice(0, 4).map((product, index) => (
                    <div key={index} className="bg-white border rounded-md overflow-hidden">
                      <div className="h-24 bg-gray-100">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <h5 className="font-medium text-sm truncate">{product.name}</h5>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{product.price}</span>
                          <Button size="sm" className="h-6 text-xs px-2" style={{ backgroundColor: primaryColor }}>
                            Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Premium Features Promotion */}
      <div className="mt-8 p-4 border rounded-md bg-gradient-to-r from-purple-500 to-orange-500 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Premium features: Additional templates, custom CSS, font uploads, and more color options.</h3>
          </div>
          <Button className="mt-4 md:mt-0 bg-white text-purple-700 hover:bg-gray-100">
            Upgrade to Premium
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Changes saved successfully!
        </div>
      )}
    </div>
  );
};

export default CustomizeStore;