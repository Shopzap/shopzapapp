
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, CheckCircle, AlertCircle, ExternalLink, Unplug } from 'lucide-react';
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

  const handleConnectInstagram = async () => {
    if (!storeData) {
      toast({
        title: "Error",
        description: "Store data not available. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Check for existing active connection
    const { data: existingConnection } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingConnection) {
      toast({
        title: "Already Connected",
        description: `Instagram account @${existingConnection.ig_username} is already connected to this store.`,
        variant: "destructive"
      });
      return;
    }
    
    const state = btoa(JSON.stringify({
      store_id: storeData.id,
      user_id: storeData.user_id
    }));
    
    // Use Supabase URL directly instead of environment variable
    const callbackUrl = `https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback`;
    const sendpulseAuthUrl = `https://oauth.sendpulse.com/authorize?` +
      `client_id=your-client-id` +
      `&response_type=code` +
      `&scope=chatbots,user_data` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&state=${state}`;
    
    window.location.href = sendpulseAuthUrl;
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Instagram account? This will disable all automation features.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ 
          is_active: false,
          access_token: null // Clear token for security
        })
        .eq('store_id', storeData.id);
      
      if (error) throw error;
      
      onConnectionUpdate(null);
      
      toast({
        title: "Instagram Disconnected",
        description: "Your Instagram account has been disconnected. Automation features are now disabled.",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnection Failed",
        description: "Unable to disconnect Instagram account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Instagram className="h-5 w-5" />
          <span>Instagram Business Connection</span>
        </CardTitle>
        <CardDescription>
          Connect your Instagram Business Account via SendPulse to enable DM automation and comment responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* App Status Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>SendPulse Integration Status:</strong> Under Review - Testing mode active with limited functionality
            <Button variant="link" className="p-0 h-auto ml-1" asChild>
              <a href="https://sendpulse.com/integrations/api" target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center">
                Learn more <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        {igConnection ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900 flex items-center">
                  Connected as @{igConnection.ig_username}
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Active
                  </span>
                </p>
                <p className="text-sm text-green-700">
                  Connected: {new Date(igConnection.connected_at).toLocaleDateString()}
                </p>
                {igConnection.page_name && (
                  <p className="text-xs text-green-600">Business Page: {igConnection.page_name}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-red-600 hover:text-red-700">
              <Unplug className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-900">Instagram Not Connected</p>
                <p className="text-sm text-orange-700">
                  Connect your Instagram Business Account to enable automated DM replies and comment responses
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Requires Instagram Business Account with SendPulse integration
                </p>
              </div>
            </div>
            <Button onClick={handleConnectInstagram} className="bg-purple-600 hover:bg-purple-700">
              <Instagram className="h-4 w-4 mr-2" />
              Connect Instagram
            </Button>
          </div>
        )}

        {/* Security Note */}
        {igConnection && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            🔒 Your access tokens are securely encrypted and stored. ShopZap never accesses your Instagram content directly.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstagramConnectionCard;
