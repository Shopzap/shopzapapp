
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, CheckCircle, ExternalLink, AlertCircle, Key } from 'lucide-react';

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
  const [apiToken, setApiToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleConnectWithToken = async () => {
    if (!apiToken.trim()) {
      toast({
        title: "API Token Required",
        description: "Please enter your ManyChat API token",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Call our edge function to validate the token and get page data
      const { data, error } = await supabase.functions.invoke('manychat-connect', {
        body: {
          apiToken: apiToken.trim(),
          storeId: storeData.id
        }
      });

      if (error) throw error;

      // Store connection in Supabase
      const { data: connection, error: dbError } = await supabase
        .from('instagram_connections')
        .insert({
          store_id: storeData.id,
          instagram_page_id: data.instagram_page_id,
          manychat_page_id: data.bot_id,
          page_name: data.page_name,
          access_token: apiToken.trim(),
          manychat_api_key: apiToken.trim(),
          is_active: true
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      onConnectionUpdate(connection);
      setShowTokenInput(false);
      setApiToken('');
      
      toast({
        title: "Successfully Connected!",
        description: `Connected ${data.page_name} to ManyChat automation.`,
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect ManyChat. Please check your API token.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Connect ManyChat for Instagram Automation</span>
        </CardTitle>
        <CardDescription>
          Connect your ManyChat account using your API token for Instagram DM automation.
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
                <li>• ManyChat API token (generated from your account settings)</li>
              </ul>
            </div>
          </div>
        </div>

        {showTokenInput ? (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="api-token">ManyChat API Token</Label>
              <Input
                id="api-token"
                type="password"
                placeholder="Enter your ManyChat API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find your API token in ManyChat → Settings → API
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleConnectWithToken}
                disabled={isConnecting || !apiToken.trim()}
                className="flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>{isConnecting ? "Connecting..." : "Connect Account"}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTokenInput(false);
                  setApiToken('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowTokenInput(true)}
              className="flex items-center space-x-2"
              size="lg"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Connect ManyChat Account</span>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://help.manychat.com/hc/en-us/articles/360017176634-How-to-get-your-API-token" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Token
              </a>
            </Button>
          </div>
        )}

        {isConnecting && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 text-sm">
              🔄 Connecting your ManyChat account and fetching page data...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstagramConnectionCard;
