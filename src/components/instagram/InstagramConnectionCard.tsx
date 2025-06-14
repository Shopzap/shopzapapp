
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleConnectInstagram = () => {
    if (!storeData) {
      toast({
        title: "Error",
        description: "Store data not available. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    const state = btoa(JSON.stringify({
      store_id: storeData.id,
      user_id: storeData.user_id
    }));
    
    const callbackUrl = `${window.location.origin}/functions/v1/sendpulse-callback`;
    const sendpulseAuthUrl = `https://oauth.sendpulse.com/authorize?` +
      `client_id=${import.meta.env.VITE_SENDPULSE_CLIENT_ID || 'your-client-id'}` +
      `&response_type=code` +
      `&scope=chatbots,user_data` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&state=${state}`;
    
    window.location.href = sendpulseAuthUrl;
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('store_id', storeData.id);
      
      if (error) throw error;
      
      onConnectionUpdate(null);
      
      toast({
        title: "Instagram disconnected",
        description: "Your Instagram account has been disconnected from automation",
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

  return (
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
        {/* App Status Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>SendPulse App Status:</strong> Under Review - Testing available with limited functionality
            <Button variant="link" className="p-0 h-auto ml-1" asChild>
              <a href="https://sendpulse.com/integrations/api" target="_blank" rel="noopener noreferrer" className="text-xs">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        {igConnection ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900">Connected as @{igConnection.ig_username}</p>
                <p className="text-sm text-green-700">
                  Connected: {new Date(igConnection.connected_at).toLocaleDateString()}
                </p>
                {igConnection.page_name && (
                  <p className="text-xs text-green-600">Page: {igConnection.page_name}</p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-900">Instagram not connected</p>
                <p className="text-sm text-orange-700">
                  Connect to enable auto-replies and DM automation
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
  );
};

export default InstagramConnectionCard;
