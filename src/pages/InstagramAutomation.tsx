
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, MessageCircle, Users, BarChart3 } from 'lucide-react';
import InstagramConnectionCard from '@/components/instagram/InstagramConnectionCard';
import KeywordAutomationSection from '@/components/instagram/KeywordAutomationSection';
import ReelsAutomationSection from '@/components/instagram/ReelsAutomationSection';
import StoryWelcomeSection from '@/components/instagram/StoryWelcomeSection';
import InstagramAnalytics from '@/components/instagram/InstagramAnalytics';

const InstagramAutomation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [igConnection, setIgConnection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    const fetchStoreAndConnection = async () => {
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
    
    fetchStoreAndConnection();
  }, [navigate, toast]);

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

  const tabs = [
    { id: 'setup', label: 'Connection', icon: Instagram },
    { id: 'keywords', label: 'Keywords', icon: MessageCircle },
    { id: 'reels', label: 'Reels & Posts', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Instagram Automation</h1>
        <p className="text-muted-foreground">
          Automate your Instagram DMs and boost customer engagement
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'setup' && (
          <InstagramConnectionCard 
            storeData={storeData}
            igConnection={igConnection}
            onConnectionUpdate={setIgConnection}
          />
        )}

        {activeTab === 'keywords' && igConnection && (
          <KeywordAutomationSection 
            storeData={storeData}
            igConnection={igConnection}
          />
        )}

        {activeTab === 'reels' && igConnection && (
          <ReelsAutomationSection 
            storeData={storeData}
            igConnection={igConnection}
          />
        )}

        {activeTab === 'analytics' && igConnection && (
          <InstagramAnalytics 
            storeData={storeData}
            igConnection={igConnection}
          />
        )}

        {(activeTab !== 'setup' && !igConnection) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Instagram className="h-5 w-5" />
                <span>Connect Instagram First</span>
              </CardTitle>
              <CardDescription>
                You need to connect your Instagram account before setting up automation features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveTab('setup')}>
                Go to Connection Setup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstagramAutomation;
