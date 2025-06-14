import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Plus, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const InstagramAutomation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [igConnection, setIgConnection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [triggerKeywords, setTriggerKeywords] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (storeError || !storeData) {
          toast({
            title: "Store not found",
            description: "Please complete seller onboarding first",
            variant: "destructive"
          });
          navigate('/onboarding');
          return;
        }
        
        setStoreData(storeData);
        
        // Check for existing Instagram connection
        const { data: igData } = await supabase
          .from('instagram_connections')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .maybeSingle();
        
        setIgConnection(igData);
        
        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name')
          .eq('store_id', storeData.id)
          .eq('is_published', true);
        
        setProducts(productsData || []);
        
        // Fetch existing automations
        if (igData) {
          const { data: automationsData } = await supabase
            .from('ig_automations')
            .select(`
              *,
              products (
                id,
                name
              )
            `)
            .eq('store_id', storeData.id);
          
          setAutomations(automationsData || []);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);

  useEffect(() => {
    // Handle OAuth callback results
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'connected') {
      toast({
        title: "Instagram Connected Successfully! ✅",
        description: "Your Instagram Business Account is now connected. You can create automation triggers.",
      });
      // Remove search params and refresh data
      window.history.replaceState({}, '', '/dashboard/instagram-automation');
      window.location.reload();
    }
    
    if (error) {
      let errorMessage = "Connection failed. Please try again.";
      
      switch (error) {
        case 'no_code':
          errorMessage = "Authorization was cancelled or failed.";
          break;
        case 'invalid_state':
          errorMessage = "Invalid request state. Please try connecting again.";
          break;
        case 'already_connected':
          errorMessage = "An Instagram account is already connected to this store.";
          break;
        case 'token_exchange_failed':
          errorMessage = "Failed to exchange authorization code. Please try again.";
          break;
        case 'account_fetch_failed':
          errorMessage = "Could not fetch Instagram account information.";
          break;
        case 'no_instagram_accounts':
          errorMessage = "No Instagram business accounts found. Please ensure you have a business account connected to SendPulse.";
          break;
        case 'database_error':
          errorMessage = "Failed to save connection. Please try again.";
          break;
        default:
          errorMessage = "An unexpected error occurred during connection.";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Remove error param from URL
      window.history.replaceState({}, '', '/dashboard/instagram-automation');
    }
  }, [searchParams, toast]);

  const handleConnectInstagram = async () => {
    if (!storeData) {
      toast({
        title: "Error",
        description: "Store data not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for existing connection before proceeding
    const { data: existingConnection } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingConnection) {
      toast({
        title: "Already Connected",
        description: `Instagram account @${existingConnection.ig_username} is already connected.`,
        variant: "destructive"
      });
      return;
    }
    
    // Create state parameter with store and user info
    const state = btoa(JSON.stringify({
      store_id: storeData.id,
      user_id: storeData.user_id
    }));
    
    // SendPulse OAuth URL - using the correct callback URL
    const callbackUrl = `https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback`;
    const sendpulseAuthUrl = `https://oauth.sendpulse.com/authorize?` +
      `client_id=your-client-id` +
      `&response_type=code` +
      `&scope=chatbots,user_data` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&state=${state}`;
    
    console.log('Redirecting to SendPulse OAuth:', sendpulseAuthUrl);
    window.location.href = sendpulseAuthUrl;
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('store_id', storeData.id);
      
      if (error) throw error;
      
      setIgConnection(null);
      setAutomations([]);
      
      toast({
        title: "Instagram disconnected",
        description: "Your Instagram account has been disconnected",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error disconnecting",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSaveAutomation = async () => {
    if (!triggerKeywords.trim()) {
      toast({
        title: "Keywords required",
        description: "Please enter trigger keywords",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const keywordsArray = triggerKeywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('save-ig-automation', {
        body: {
          store_id: storeData.id,
          product_id: selectedProduct || null,
          trigger_keywords: keywordsArray
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });
      
      if (response.error) throw response.error;
      
      // Refresh automations
      const { data: automationsData } = await supabase
        .from('ig_automations')
        .select(`
          *,
          products (
            id,
            name
          )
        `)
        .eq('store_id', storeData.id);
      
      setAutomations(automationsData || []);
      setSelectedProduct('');
      setTriggerKeywords('');
      
      toast({
        title: "Automation saved",
        description: "Your trigger has been created successfully",
      });
      
    } catch (error) {
      console.error('Save automation error:', error);
      toast({
        title: "Error saving automation",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      const { error } = await supabase
        .from('ig_automations')
        .delete()
        .eq('id', automationId);
      
      if (error) throw error;
      
      setAutomations(automations.filter(a => a.id !== automationId));
      
      toast({
        title: "Automation deleted",
        description: "Trigger has been removed",
      });
      
    } catch (error) {
      console.error('Delete automation error:', error);
      toast({
        title: "Error deleting automation",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Instagram automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Instagram Automation</h1>
        <p className="text-muted-foreground">
          Connect your Instagram Business Account via SendPulse to enable auto-replies and DM automation
        </p>
      </div>

      {/* SendPulse App Status Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Our SendPulse integration app is currently under review. 
          You can test the connection, but full functionality will be available once approved.
          <Button variant="link" className="p-0 h-auto ml-2" asChild>
            <a href="https://sendpulse.com/integrations/api" target="_blank" rel="noopener noreferrer">
              View SendPulse Developer Portal <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </AlertDescription>
      </Alert>

      {/* Section 1: Instagram Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Instagram className="h-5 w-5" />
            <span>Instagram Connection</span>
          </CardTitle>
          <CardDescription>
            Connect your Instagram Business Account via SendPulse to enable automation features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {igConnection ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Connected as @{igConnection.ig_username}</p>
                  <p className="text-sm text-green-700">
                    Connected: {new Date(igConnection.connected_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Page: {igConnection.page_name}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Account
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-900">Instagram not connected</p>
                  <p className="text-sm text-orange-700">
                    Connect your Instagram Business Account to start automating DMs and replies
                  </p>
                </div>
              </div>
              <Button onClick={handleConnectInstagram}>
                Connect Instagram
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Create Automation Trigger */}
      {igConnection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create Automation Trigger</span>
            </CardTitle>
            <CardDescription>
              Set up keyword triggers to automatically send DMs with product links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Select Product (Optional)</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific product</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Trigger Keywords</Label>
                <Input
                  id="keywords"
                  value={triggerKeywords}
                  onChange={(e) => setTriggerKeywords(e.target.value)}
                  placeholder="saree, offer, buy (comma-separated)"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveAutomation} 
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Automation"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Existing Automations */}
      {igConnection && automations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Automations</CardTitle>
            <CardDescription>
              Manage your current automation triggers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automations.map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {automation.products?.name || 'General Automation'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {automation.trigger_keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(automation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteAutomation(automation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstagramAutomation;
