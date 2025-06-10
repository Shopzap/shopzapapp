
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [storeName, setStoreName] = useState("");
  const [storeTheme, setStoreTheme] = useState("light");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Generate slug from store name
  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const currentSlug = generateSlug(storeName);
  
  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!storeName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a store name",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    let storeLogoUrl = null;
    
    try {
      // Step 1: Upload logo if selected
      if (logoFile) {
        // Create a unique filename for the logo
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('store_logos')
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          throw new Error(`Error uploading logo: ${uploadError.message}`);
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('store_logos')
          .getPublicUrl(filePath);
          
        storeLogoUrl = urlData.publicUrl;
      }
      
      // Step 2: Generate slug from store name
      const slug = generateSlug(storeName);
      
      // Step 3: Check if slug already exists
      const { data: existingStore, error: checkError } = await supabase
        .from('stores')
        .select('slug')
        .eq('slug', slug)
        .single();
      
      if (existingStore) {
        toast({
          title: "Store name already exists",
          description: "Please choose a different store name",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Step 4: Save store data to Supabase
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            slug: slug,
            logo_image: storeLogoUrl,
            user_id: user.id,
            business_email: user.email || '',
            phone_number: '', // This is a required field in the stores table
            theme: { mode: storeTheme },
            plan: 'free'
          }
        ])
        .select()
        .single();
        
      if (storeError) {
        throw new Error(`Error creating store: ${storeError.message}`);
      }
      
      // Success toast
      toast({
        title: "Store created successfully!",
        description: "Redirecting to product dashboard...",
      });
      
      // Redirect to products dashboard
      navigate("/dashboard/products");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap.io</div>
          <CardTitle className="text-2xl">Setup Your Store</CardTitle>
          <CardDescription className="text-base">
            Let's get your WhatsApp store ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input 
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter your store name"
                required
              />
              {storeName && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Your store URL: <span className="font-medium">shopzap.io/store/{currentSlug}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Store Logo</Label>
              <div className="flex flex-col items-center gap-4">
                {logoPreview && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="logo" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                    </div>
                    <Input 
                      id="logo" 
                      type="file"
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Store Theme</Label>
              <RadioGroup 
                value={storeTheme} 
                onValueChange={setStoreTheme}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Store...
                </>
              ) : "Continue to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
