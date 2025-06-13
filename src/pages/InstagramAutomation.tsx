
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Settings, Play } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

const InstagramAutomation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
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
        
      } catch (error) {
        console.error("Error fetching store data:", error);
        toast({
          title: "Error loading store",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreData();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading automation settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container p-4 mx-auto space-y-6 max-w-4xl">
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Instagram Automation</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Instagram Integration</CardTitle>
            <CardDescription>
              Connect your Instagram account to automatically share your products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <Instagram className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Instagram Automation Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're working on Instagram integration features that will allow you to:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
                <li>• Automatically post new products to your Instagram</li>
                <li>• Schedule promotional posts</li>
                <li>• Sync product catalogs</li>
                <li>• Track engagement metrics</li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="outline" disabled>
                <Settings className="w-4 h-4 mr-2" />
                Configure Settings
              </Button>
              <Button disabled>
                <Play className="w-4 h-4 mr-2" />
                Start Automation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InstagramAutomation;
