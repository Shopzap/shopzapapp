
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface InstagramOAuthButtonProps {
  storeId: string;
  onConnectionStart: () => void;
}

const InstagramOAuthButton: React.FC<InstagramOAuthButtonProps> = ({
  storeId,
  onConnectionStart
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-manychat-config');
        if (error) throw error;
        setClientId(data.client_id);
      } catch (error) {
        console.error('Failed to fetch ManyChat config:', error);
      }
    };

    fetchClientId();
  }, []);

  const handleConnect = () => {
    if (!clientId) {
      console.error('ManyChat client ID not available');
      return;
    }

    setIsConnecting(true);
    onConnectionStart();

    // ManyChat OAuth URL with your centralized app credentials
    const manyChatOAuthUrl = new URL('https://api.manychat.com/oauth/authorize');
    manyChatOAuthUrl.searchParams.set('client_id', clientId);
    manyChatOAuthUrl.searchParams.set('response_type', 'code');
    manyChatOAuthUrl.searchParams.set('scope', 'basic pages:read pages:write');
    manyChatOAuthUrl.searchParams.set('state', storeId);
    manyChatOAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/dashboard/instagram`);

    console.log('OAuth URL:', manyChatOAuthUrl.toString());
    console.log('Redirect URI:', `${window.location.origin}/dashboard/instagram`);

    // Open OAuth flow
    window.location.href = manyChatOAuthUrl.toString();
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting || !clientId}
      className="flex items-center space-x-2"
      size="lg"
    >
      <MessageSquare className="h-5 w-5" />
      <span>{isConnecting ? "Connecting..." : "Connect ManyChat Account"}</span>
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};

export default InstagramOAuthButton;
