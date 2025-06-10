
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";

const StoreBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate slug from store name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };
  
  // Auto-generate slug from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    
    if (name.trim()) {
      const generatedSlug = generateSlug(name);
      setStoreSlug(generatedSlug);
    } else {
      setStoreSlug('');
    }
  };
  
  // Handle manual slug editing
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setStoreSlug(slug);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please log in to create a store",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userId = user.id;
      
      // Validate slug
      if (!storeSlug || storeSlug.length < 3) {
        toast({
          title: "Invalid store URL",
          description: "Store URL must be at least 3 characters long",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Check if slug already exists
      const { data: existingStore, error: checkError } = await supabase
        .from('stores')
        .select('slug')
        .eq('slug', storeSlug)
        .single();
      
      if (existingStore) {
        toast({
          title: "Store URL already taken",
          description: "Please choose a different store URL",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create store with the slug
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName.trim(),
            slug: storeSlug,
            username: storeSlug, // Keep username for backward compatibility
            phone_number: whatsappNumber,
            user_id: userId,
            business_email: user.email || '',
            plan: 'free'
          }
        ])
        .select()
        .single();
      
      if (storeError) {
        console.error("Store creation error:", storeError);
        toast({
          title: "Error creating store",
          description: storeError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Store created successfully!",
        description: `Your store is now available at shopzap.io/store/${storeSlug}`,
      });
      
      // Redirect to dashboard
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-accent/30 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Link to="/onboarding" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} className="mr-1" />
          Back to onboarding
        </Link>
        
        <Card>
          <CardHeader>
            <div className="mb-4 font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap.io</div>
            <CardTitle className="text-2xl">Create Your Store</CardTitle>
            <CardDescription>
              Let's set up the basic information for your WhatsApp store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName"
                    placeholder="e.g., Fashion Paradise" 
                    value={storeName}
                    onChange={handleStoreNameChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeSlug">Your Store URL</Label>
                  <div className="flex items-center">
                    <div className="bg-muted px-3 py-2 rounded-l-md border-y border-l border-input text-muted-foreground text-sm">
                      shopzap.io/store/
                    </div>
                    <Input
                      id="storeSlug"
                      className="rounded-l-none"
                      placeholder="your-store-name" 
                      value={storeSlug}
                      onChange={handleSlugChange}
                      required
                      minLength={3}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a unique URL for your store (only lowercase letters, numbers, and hyphens)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <div className="flex">
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="e.g., +919876543210" 
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Store Logo (Optional)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Store...
                </>
              ) : "Create Store"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StoreBuilder;
