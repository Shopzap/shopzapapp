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

  const fetchStoreData = async () => {
    if (user) {
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
          if (data.theme) {
            const theme = data.theme as { primary_color?: string; secondary_color?: string; theme_layout?: 'card' | 'list' };
            setPrimaryColor(theme.primary_color || '#6c5ce7');
            setSecondaryColor(theme.secondary_color || '#f1c40f');
            setThemeStyle(theme.theme_layout || 'card');
          }
        }
      }
    };

    fetchStoreData();
  };

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        setLogo(publicUrlData.publicUrl);
        setLogoUrl(publicUrlData.publicUrl);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const { data, error } = await supabase
      .from('stores')
      .upsert({
        user_id: user.id,
        name: storeName,
        logo_image: logoUrl,
        theme: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          theme_layout: themeStyle,
        },
        business_email: user.email || '',
        phone_number: '',
        username: user.email || '',
        address: null,
        banner_image: null,
        created_at: null,
        description: null,
        is_active: true
      })
      .eq('user_id', user.id)
      .select()
      .single();

      if (error) {
      console.error('Error saving store data:', error.message);
      setIsSaving(false);
    } else if (data) {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchStoreData(); // Re-fetch data to update the UI
    } else {
      console.warn('Update successful but no data returned.');
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
      <div className="mb-6 px-4">
        <h1 className="text-3xl font-bold">Customize Store</h1>
        <p className="text-muted-foreground">Update your store's appearance and branding settings.</p>
      </div>

      {/* Section 1: Store Info */}
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
              <Button variant="outline" onClick={() => setLogoUrl(null)}>Remove Logo</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Section 2: Store Colors */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Store Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor" className="mb-1 block">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primaryColor"
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className="w-8 h-8 rounded-md border cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  />
                </DialogTrigger>
                <DialogContent className="p-0 border-none max-w-fit">
                  <DialogTitle>Customize Your Store</DialogTitle>
                  <DialogDescription>Update your store name, logo, theme and preview it live.</DialogDescription>
                  <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div>
            <Label htmlFor="secondaryColor" className="mb-1 block">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondaryColor"
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className="w-8 h-8 rounded-md border cursor-pointer"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </DialogTrigger>
<DialogContent className="p-0 border-none max-w-fit">
                   <DialogTitle>Customize Your Store</DialogTitle>
                   <DialogDescription>Update your store name, logo, theme and preview it live.</DialogDescription>
                   <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                 </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Theme Style */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Store Layout Style</h2>
        <p className="text-muted-foreground mb-4">Choose how your products are displayed on the storefront</p>
        <RadioGroup value={themeStyle} onValueChange={(value: 'card' | 'list') => setThemeStyle(value)} className="space-y-4">
          <Label htmlFor="cardLayout" className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-muted/50">
            <RadioGroupItem value="card" id="cardLayout" />
            <div>
              <span className="font-medium">Card Grid Layout</span>
              <p className="text-sm text-muted-foreground">Image + name + price in a card</p>
            </div>
            {/* Icon/Thumbnail Preview */}
            <div className="ml-auto w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
              Grid
            </div>
          </Label>
          <Label htmlFor="listLayout" className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-muted/50">
            <RadioGroupItem value="list" id="listLayout" />
            <div>
              <span className="font-medium">List Layout</span>
              <p className="text-sm text-muted-foreground">Larger image with name and description in row format</p>
            </div>
            {/* Icon/Thumbnail Preview */}
            <div className="ml-auto w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
              List
            </div>
          </Label>
        </RadioGroup>
      </Card>

      {/* Section 4: Live Preview */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
        <div className="border rounded-md p-4 overflow-y-auto max-h-[500px]"
          style={{
            '--primary-color': primaryColor,
            '--secondary-color': secondaryColor,
          } as React.CSSProperties}
        >
          {/* Mock Storefront Header */}
          <div className="flex items-center justify-between p-3 mb-4 rounded-md"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <div className="flex items-center gap-2">
            {logoUrl && <img src={logoUrl} alt="Store Logo" className="h-8 w-auto" />}
            <h3 className="text-lg font-bold" style={{ color: 'var(--secondary-color)' }}>{storeName}</h3>
            </div>
            <Button style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>Shop Now</Button>
          </div>

          {/* Mock Product Display */}
          {themeStyle === 'card' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {fakeProducts.map((product, index) => (
                <FakeProductCard key={index} {...product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {fakeProducts.map((product, index) => (
                <FakeProductList key={index} {...product} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Section 5: Save Button */}
      <div className="sticky bottom-0 bg-background p-4 border-t flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saveSuccess && <p className="text-green-500 ml-4">Changes saved successfully!</p>}
      </div>
    </div>
  );
};

export default CustomizeStore;