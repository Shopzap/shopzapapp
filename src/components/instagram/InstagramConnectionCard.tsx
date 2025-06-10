
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, CheckCircle, ExternalLink, Key } from 'lucide-react';

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
  const [connectionForm, setConnectionForm] = useState({
    instagram_page_id: '',
    manychat_page_id: '',
    page_name: '',
    access_token: '',
    manychat_api_key: ''
  });

  const handleConnect = async () => {
    if (!connectionForm.instagram_page_id || !connectionForm.manychat_page_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in both Instagram Page ID and ManyChat Page ID",
        variant: "destructive"
      });
      return;
    }

    if (!connectionForm.manychat_api_key) {
      toast({
        title: "Missing API Key",
        description: "Please provide your ManyChat API key",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase
        .from('instagram_connections')
        .insert({
          store_id: storeData.id,
          instagram_page_id: connectionForm.instagram_page_id,
          manychat_page_id: connectionForm.manychat_page_id,
          page_name: connectionForm.page_name,
          access_token: connectionForm.access_token,
          manychat_api_key: connectionForm.manychat_api_key,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      onConnectionUpdate(data);
      toast({
        title: "Instagram Connected",
        description: "Your Instagram account with ManyChat has been successfully connected!",
      });
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Instagram. Please try again.",
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
        title: "Instagram Disconnected",
        description: "Your Instagram account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect Instagram. Please try again.",
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
            <span>Instagram Connected</span>
          </CardTitle>
          <CardDescription>
            Your Instagram account is successfully connected and ready for automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Page Name</Label>
              <p className="font-medium">{igConnection.page_name || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Connected Date</Label>
              <p className="font-medium">
                {new Date(igConnection.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect Instagram
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
          <Instagram className="h-5 w-5" />
          <span>Connect Instagram with ManyChat</span>
        </CardTitle>
        <CardDescription>
          Connect your Instagram Business Account with ManyChat to enable automation features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-blue-900">Setup Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Instagram Business Account</li>
            <li>• Facebook Page linked to Instagram</li>
            <li>• ManyChat account with Instagram integration</li>
            <li>• ManyChat API key with proper permissions</li>
            <li>• Message permissions approved</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="page_name">Instagram Page Name (Optional)</Label>
            <Input
              id="page_name"
              placeholder="Your Instagram page name"
              value={connectionForm.page_name}
              onChange={(e) => setConnectionForm(prev => ({
                ...prev,
                page_name: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="instagram_page_id">Instagram Page ID *</Label>
            <Input
              id="instagram_page_id"
              placeholder="Your Instagram page ID from ManyChat"
              value={connectionForm.instagram_page_id}
              onChange={(e) => setConnectionForm(prev => ({
                ...prev,
                instagram_page_id: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="manychat_page_id">ManyChat Page ID *</Label>
            <Input
              id="manychat_page_id"
              placeholder="Your ManyChat page ID"
              value={connectionForm.manychat_page_id}
              onChange={(e) => setConnectionForm(prev => ({
                ...prev,
                manychat_page_id: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="manychat_api_key" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>ManyChat API Key *</span>
            </Label>
            <Input
              id="manychat_api_key"
              type="password"
              placeholder="Your ManyChat API key"
              value={connectionForm.manychat_api_key}
              onChange={(e) => setConnectionForm(prev => ({
                ...prev,
                manychat_api_key: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="access_token">Access Token (Optional)</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="Additional access token if required"
              value={connectionForm.access_token}
              onChange={(e) => setConnectionForm(prev => ({
                ...prev,
                access_token: e.target.value
              }))}
            />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Where to find your ManyChat API Key:</h4>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Go to ManyChat dashboard</li>
            <li>2. Click on "Settings" → "API"</li>
            <li>3. Generate or copy your API key</li>
            <li>4. Make sure it has the required permissions for Instagram messaging</li>
          </ol>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="flex-1"
          >
            {isConnecting ? "Connecting..." : "Connect Instagram & ManyChat"}
          </Button>
          <Button variant="outline" asChild>
            <a href="https://manychat.com/help/instagram-setup" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Setup Guide
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramConnectionCard;
