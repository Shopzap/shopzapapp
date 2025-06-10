
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, MessageCircle, Settings, BarChart3, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import InstagramConnect from '@/components/instagram/InstagramConnect';
import KeywordManager from '@/components/instagram/KeywordManager';
import ReelsAutomation from '@/components/instagram/ReelsAutomation';
import StoryAutomation from '@/components/instagram/StoryAutomation';
import WelcomeAutomation from '@/components/instagram/WelcomeAutomation';
import DMAnalytics from '@/components/instagram/DMAnalytics';

const InstagramAutomation = () => {
  const { user } = useAuth();
  const { storeData } = useStore();
  const [activeTab, setActiveTab] = useState('connect');

  if (!user || !storeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Instagram Automation</h1>
          <p className="text-muted-foreground">Please create a store first to access Instagram automation features.</p>
        </div>
      </div>
    );
  }

  const isPro = storeData.plan === 'pro';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Instagram className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold">Instagram DM Automation</h1>
          {isPro && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="w-3 h-3 mr-1" />Pro</Badge>}
        </div>
        <p className="text-muted-foreground text-lg">
          Automate your Instagram DMs, story replies, and comments to boost sales with AI-powered responses in Hindi, English, and Hinglish.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="connect" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Connect
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Reels
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="welcome" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Welcome
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!isPro}>
            <BarChart3 className="w-4 h-4" />
            Analytics {!isPro && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect">
          <InstagramConnect storeId={storeData.id} />
        </TabsContent>

        <TabsContent value="keywords">
          <KeywordManager storeId={storeData.id} isPro={isPro} />
        </TabsContent>

        <TabsContent value="reels">
          <ReelsAutomation storeId={storeData.id} isPro={isPro} />
        </TabsContent>

        <TabsContent value="stories">
          <StoryAutomation storeId={storeData.id} isPro={isPro} />
        </TabsContent>

        <TabsContent value="welcome">
          <WelcomeAutomation storeId={storeData.id} />
        </TabsContent>

        <TabsContent value="analytics">
          {isPro ? (
            <DMAnalytics storeId={storeData.id} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Analytics - Pro Feature
                </CardTitle>
                <CardDescription>
                  Upgrade to Pro to access detailed DM analytics, conversion tracking, and performance insights.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstagramAutomation;
