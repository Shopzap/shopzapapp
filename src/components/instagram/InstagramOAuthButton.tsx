
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from 'lucide-react';

interface InstagramOAuthButtonProps {
  storeId: string;
  onConnectionStart: () => void;
}

const InstagramOAuthButton: React.FC<InstagramOAuthButtonProps> = ({
  storeId,
  onConnectionStart
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    onConnectionStart();

    // ManyChat OAuth URL with proper scopes
    const manyChatOAuthUrl = new URL('https://api.manychat.com/oauth/authorize');
    manyChatOAuthUrl.searchParams.set('client_id', process.env.REACT_APP_MANYCHAT_CLIENT_ID || '');
    manyChatOAuthUrl.searchParams.set('response_type', 'code');
    manyChatOAuthUrl.searchParams.set('scope', 'basic pages:read pages:write');
    manyChatOAuthUrl.searchParams.set('state', storeId);
    manyChatOAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/dashboard/instagram`);

    // Open OAuth flow
    window.location.href = manyChatOAuthUrl.toString();
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      className="flex items-center space-x-2"
      size="lg"
    >
      <Instagram className="h-5 w-5" />
      <span>{isConnecting ? "Connecting..." : "Connect Instagram & ManyChat"}</span>
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};

export default InstagramOAuthButton;
