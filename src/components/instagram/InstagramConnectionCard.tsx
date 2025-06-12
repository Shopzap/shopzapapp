
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, CheckCircle, AlertCircle } from 'lucide-react';

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
    if (!storeData) return;
    
    const state = btoa(JSON.stringify({
      store_id: storeData.id,
      user_id: storeData.user_id
    }));
    
    const sendpulseAuthUrl = `https://oauth.sendpulse.com/authorize?client_id=${process.env.SENDPULSE_CLIENT_ID}&response_type=code&scope=instagram&redirect_uri=${encodeURIComponent(`${window.location.origin}/functions/v1/sendpulse-oauth`)}&state=${state}`;
    
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

  if (igConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Instagram Connected</span>
          </CardTitle>
          <CardDescription>
            Your Instagram account is successfully connected via SendPulse and ready for automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900">Connected as @{igConnection.ig_username}</p>
                <p className="text-sm text-green-700">
                  Last synced: {new Date(igConnection.connected_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect Account
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
          <span>Instagram Connection</span>
        </CardTitle>
        <CardDescription>
          Connect your Instagram account via SendPulse to enable automation features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium text-orange-900">Instagram not connected</p>
              <p className="text-sm text-orange-700">
                Connect your account to start creating automations
              </p>
            </div>
          </div>
          <Button onClick={handleConnectInstagram}>
            Connect Instagram via SendPulse
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramConnectionCard;
