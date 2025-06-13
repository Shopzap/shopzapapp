
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
import { createStoreUsername } from '@/utils/slugHelpers';

const StoreBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeUsername, setStoreUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Auto-generate and validate username from store name
  const handleStoreNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    
    if (!name.trim()) {
      setStoreUsername("");
      setUsernameAvailable(null);
      return;
    }
    
    // Generate clean username from store name
    const username = createStoreUsername(name);
    setStoreUsername(username);
    
    // Check if username is available
    if (username && username.length >= 3) {
      setIsCheckingUsername(true);
      try {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('username')
          .eq('username', username)
          .maybeSingle();
        
        setUsernameAvailable(!existingStore);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }
  };
  
  // Manual username validation
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setStoreUsername(username);
    
    if (username && username.length >= 3) {
      setIsCheckingUsername(true);
      try {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('username')
          .eq('username', username)
          .maybeSingle();
        
        setUsernameAvailable(!existingStore);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(null);
    }
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
      
      // Clean store name for display
      const cleanStoreName = storeName.trim();
      
      // Clean username for URL (no suffixes, exactly as entered)
      const cleanUsername = storeUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (!cleanUsername || cleanUsername.length < 3) {
        toast({
          title: "Invalid username",
          description: "Username must be at least 3 characters long and contain only letters and numbers",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (usernameAvailable === false) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Final check before creating store
      const { data: existingStore } = await supabase
        .from('stores')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();
      
      if (existingStore) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive"
        });
        setUsernameAvailable(false);
        setIsLoading(false);
        return;
      }
      
      // Create store with the clean name and username (NO SUFFIXES)
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: cleanStoreName,
            username: cleanUsername, // Exact username as entered, no suffixes
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
        description: `Your store is now available at shopzap.io/store/${cleanUsername}`,
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
                      shopzap.io/store/
                    </div>
                    <Input
                      id="storeUrl"
                      className="rounded-l-none"
                      placeholder="your-username" 
                      value={storeUsername}
                      onChange={handleUsernameChange}
                      required
                      minLength={3}
                    />
                  </div>
                  
                  {/* Username availability feedback */}
                  {isCheckingUsername && (
                    <p className="text-sm text-muted-foreground">
                      <Loader className="inline w-3 h-3 mr-1 animate-spin" />
                      Checking availability...
                    </p>
                  )}
                  
                  {!isCheckingUsername && usernameAvailable === true && storeUsername && (
                    <p className="text-sm text-green-600">
                      ✓ Username is available
                    </p>
                  )}
                  
                  {!isCheckingUsername && usernameAvailable === false && storeUsername && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Username "{storeUsername}" is already taken. Please choose a different one.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Choose a unique username (3+ characters, letters and numbers only)
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
              disabled={isLoading || isCheckingUsername || usernameAvailable === false || !storeUsername}
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
