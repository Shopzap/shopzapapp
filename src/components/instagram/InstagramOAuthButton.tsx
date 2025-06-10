
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from 'lucide-react';

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

    // ManyChat OAuth URL with your centralized app credentials
    const manyChatOAuthUrl = new URL('https://api.manychat.com/oauth/authorize');
    manyChatOAuthUrl.searchParams.set('client_id', 'your_manychat_client_id'); // This will use your centralized app
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
      <MessageSquare className="h-5 w-5" />
      <span>{isConnecting ? "Connecting..." : "Connect ManyChat Account"}</span>
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};

export default InstagramOAuthButton;
