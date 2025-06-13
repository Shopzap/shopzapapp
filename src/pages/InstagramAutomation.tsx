
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import InstagramConnectionCard from '@/components/instagram/InstagramConnectionCard';
import KeywordAutomationSection from '@/components/instagram/KeywordAutomationSection';
import InstagramAnalytics from '@/components/instagram/InstagramAnalytics';

const InstagramAutomation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [igConnection, setIgConnection] = useState<any>(null);

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
          .eq('connected', true)
          .maybeSingle();
        
        setIgConnection(igData);
        
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
    // Handle OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'connected') {
      toast({
        title: "Instagram connected successfully",
        description: "You can now create automations",
      });
      // Refresh the page to load connection data
      window.location.reload();
    }
    
    if (error) {
      toast({
        title: "Connection failed",
        description: decodeURIComponent(error),
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const handleConnectionUpdate = (connection: any) => {
    setIgConnection(connection);
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
          Connect your Instagram account via SendPulse to enable auto DMs & product promotions
        </p>
      </div>

      {/* Instagram Connection Card */}
      <InstagramConnectionCard 
        storeData={storeData}
        igConnection={igConnection}
        onConnectionUpdate={handleConnectionUpdate}
      />

      {/* Keyword Automation Section */}
      {igConnection && (
        <KeywordAutomationSection 
          storeData={storeData}
          igConnection={igConnection}
        />
      )}

      {/* Analytics Section */}
      {igConnection && (
        <InstagramAnalytics 
          storeData={storeData}
          igConnection={igConnection}
        />
      )}
    </div>
  );
};

export default InstagramAutomation;
