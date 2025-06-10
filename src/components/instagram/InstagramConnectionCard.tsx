
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import InstagramOAuthButton from './InstagramOAuthButton';
import ManyChatOAuthHandler from './ManyChatOAuthHandler';

interface InstagramConnectionCardProps {
  storeData: any;
  igConnection: any;
  onConnectionUpdate: (connection: any) => void;
}

const InstagramConnectionCard: React.FC<InstagramConnectionCardProps> = ({
  storeData,
  igConnection,
  onConnectionUpdate
}) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectionStart = () => {
    setIsConnecting(true);
  };

  const handleConnectionSuccess = (connection: any) => {
    setIsConnecting(false);
    onConnectionUpdate(connection);
  };

  const handleDisconnect = async () => {
    if (!igConnection) return;

    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('id', igConnection.id);

      if (error) throw error;

      onConnectionUpdate(null);
      toast({
        title: "ManyChat Disconnected",
        description: "Your ManyChat account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting ManyChat:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect ManyChat. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      setIsConnecting(true);
    }
  }, []);

  if (igConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>ManyChat Connected</span>
          </CardTitle>
          <CardDescription>
            Your ManyChat account is successfully connected and ready for Instagram automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Page Name</label>
              <p className="font-medium">{igConnection.page_name || 'Connected Page'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Connected Date</label>
              <p className="font-medium">
                {new Date(igConnection.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect ManyChat
            </Button>
            <Button variant="outline" asChild>
              <a href="https://manychat.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open ManyChat
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ManyChatOAuthHandler 
        storeId={storeData.id}
        onConnectionSuccess={handleConnectionSuccess}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Connect ManyChat for Instagram Automation</span>
          </CardTitle>
          <CardDescription>
            One-click connection to link your ManyChat account for Instagram DM automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">What this connection enables:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic Instagram DM responses</li>
              <li>• Keyword-triggered product recommendations</li>
              <li>• Comment automation on posts and reels</li>
              <li>• Welcome messages for new followers</li>
              <li>• Analytics and conversion tracking</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Prerequisites:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Instagram Business Account</li>
                  <li>• Facebook Page linked to Instagram</li>
                  <li>• ManyChat account connected to your Instagram page</li>
                  <li>• Admin access to your Facebook Page</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <InstagramOAuthButton 
              storeId={storeData.id}
              onConnectionStart={handleConnectionStart}
            />
            <Button variant="outline" asChild>
              <a href="https://manychat.com/help/instagram-setup" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </a>
            </Button>
          </div>

          {isConnecting && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                🔄 Connecting your account... You may be redirected to ManyChat to authorize the connection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default InstagramConnectionCard;
