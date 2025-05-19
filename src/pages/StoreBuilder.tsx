
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const StoreBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeUsername, setStoreUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Authentication error",
          description: "Please log in to create a store",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Check username availability
      const { data: usernameCheck } = await supabase
        .rpc('check_username_availability', { username: storeUsername });
      
      if (!usernameCheck) {
        toast({
          title: "Username not available",
          description: "Please choose a different store URL",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create store
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            username: storeUsername,
            phone_number: whatsappNumber,
            user_id: userId,
            business_email: sessionData.session.user.email,
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
        description: `Your store is now available at shopzap.io/${storeUsername}`,
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
  
  // Auto-generate username from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    
    // Generate slug from store name
    const slug = name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    setStoreUsername(slug);
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
                  <Label htmlFor="storeUrl">Your Store URL</Label>
                  <div className="flex items-center">
                    <div className="bg-muted px-3 py-2 rounded-l-md border-y border-l border-input text-muted-foreground">
                      shopzap.io/
                    </div>
                    <Input
                      id="storeUrl"
                      className="rounded-l-none"
                      placeholder="your-store-name" 
                      value={storeUsername}
                      onChange={(e) => setStoreUsername(e.target.value)}
                      required
                    />
                  </div>
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
            <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating Store..." : "Create Store"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StoreBuilder;
