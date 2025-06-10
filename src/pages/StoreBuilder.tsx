
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

const StoreBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate slug from store name
  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const currentSlug = generateSlug(storeName);
  
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
      
      // Generate slug from store name
      const slug = generateSlug(storeName);
      
      // Check if slug already exists
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
      
      // Create store with the slug
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            slug: slug,
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
        description: `Your store is now available at shopzap.io/store/${slug}`,
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
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                  {storeName && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      Your store URL: <span className="font-medium">shopzap.io/store/{currentSlug}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <div className="flex">
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="e.g., 9876543210" 
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
