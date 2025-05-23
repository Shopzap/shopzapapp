
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Loader } from 'lucide-react';
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
  const [storeUsername, setStoreUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  
  // Generate alternative usernames based on the current username
  const generateAlternativeUsernames = (username: string): string[] => {
    return [
      `${username}store`,
      `${username}shop`,
      `my${username}`,
      `${username}official`,
      `get${username}`
    ];
  };
  
  // Check username availability and suggest alternatives if not available
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!storeUsername || storeUsername.length < 3) {
        setUsernameError("");
        setIsUsernameAvailable(false);
        setSuggestedUsernames([]);
        return;
      }
      
      setIsCheckingUsername(true);
      setUsernameError("");
      setSuggestedUsernames([]);
      
      try {
        const trimmedUsername = storeUsername.trim().toLowerCase();
        
        // Fixed: Use Promise.race for timeout instead of .timeout() method
        const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 5000);
        });
        
        const rpcPromise = supabase.rpc('check_username_availability', { username: trimmedUsername });
        
        // Race between the RPC call and the timeout
        const { data: usernameCheck, error } = await Promise.race([
          rpcPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error("Error checking username:", error);
          setUsernameError("Error checking availability. Please try again.");
          setIsUsernameAvailable(false);
          setSuggestedUsernames([]);
          return;
        }
        
        if (usernameCheck === true) {
          setUsernameError("");
          setIsUsernameAvailable(true);
          setSuggestedUsernames([]);
          toast({
            title: "Store available ✅",
            description: `The URL shopzap.io/${trimmedUsername} is available for your store.`,
          });
        } else {
          // Username is not available, generate and check alternatives
          setUsernameError("Username not available. Please choose a different store URL");
          setIsUsernameAvailable(false);
          
          // Generate alternative usernames
          const alternatives = generateAlternativeUsernames(trimmedUsername);
          
          // Check availability of alternatives in parallel for better performance
          const availableAlternatives: string[] = [];
          const checkPromises = alternatives.map(alt => 
            supabase.rpc('check_username_availability', { username: alt })
          );
          
          const results = await Promise.all(checkPromises);
          
          // Process results
          for (let i = 0; i < results.length; i++) {
            const { data: altCheck, error: altError } = results[i];
            if (!altError && altCheck === true) {
              availableAlternatives.push(alternatives[i]);
              if (availableAlternatives.length >= 3) break;
            }
          }
          
          setSuggestedUsernames(availableAlternatives);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Error checking availability. Please try again.");
        setIsUsernameAvailable(false);
        setSuggestedUsernames([]);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    
    // Add debounce to prevent too many requests
    const debounceTimeout = setTimeout(() => {
      if (storeUsername) {
        checkUsernameAvailability();
      }
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [storeUsername, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't proceed if username is not available
    if (!isUsernameAvailable) {
      toast({
        title: "Invalid store URL",
        description: "Please choose a different store URL that is available.",
        variant: "destructive"
      });
      return;
    }
    
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
      const trimmedUsername = storeUsername.trim().toLowerCase();
      
      // Create store
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            username: trimmedUsername,
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
        description: `Your store is now available at shopzap.io/${trimmedUsername}`,
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
  
  // Handle suggested username selection
  const handleSuggestedUsernameClick = (username: string) => {
    setStoreUsername(username);
    // Trigger immediate availability check for better UX
    setTimeout(() => {
      supabase
        .rpc('check_username_availability', { username })
        .then(({ data }) => {
          if (data === true) {
            setIsUsernameAvailable(true);
            setUsernameError("");
            toast({
              title: "Store available ✅",
              description: `The URL shopzap.io/${username} is available for your store.`,
            });
          }
        });
    }, 0);
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
                    <div className="relative flex-1">
                      <Input
                        id="storeUrl"
                        className="rounded-l-none"
                        placeholder="your-store-name" 
                        value={storeUsername}
                        onChange={(e) => setStoreUsername(e.target.value)}
                        required
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {isUsernameAvailable && !isCheckingUsername && storeUsername && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-sm text-destructive">{usernameError}</p>
                  )}
                  
                  {/* Suggested usernames */}
                  {suggestedUsernames.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Suggested available usernames:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedUsernames.map((username) => (
                          <Button 
                            key={username} 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => handleSuggestedUsernameClick(username)}
                            className="flex items-center"
                          >
                            {username}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
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
              disabled={isLoading || isCheckingUsername || (!isUsernameAvailable && storeUsername.length >= 3)}
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
