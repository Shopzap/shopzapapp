
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

interface ManyChatOAuthHandlerProps {
  storeId: string;
  onConnectionSuccess: (connection: any) => void;
}

const ManyChatOAuthHandler: React.FC<ManyChatOAuthHandlerProps> = ({
  storeId,
  onConnectionSuccess
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: "Connection Failed",
        description: "ManyChat authorization was cancelled or failed.",
        variant: "destructive"
      });
      return;
    }

    if (code && state === storeId) {
      handleOAuthCallback(code);
    }
  }, [searchParams, storeId]);

  const handleOAuthCallback = async (code: string) => {
    setIsProcessing(true);
    try {
      // Exchange code for access token and fetch page data
      const response = await fetch('/api/manychat/oauth-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          storeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete OAuth flow');
      }

      const data = await response.json();
      
      // Store connection in Supabase
      const { data: connection, error } = await supabase
        .from('instagram_connections')
        .insert({
          store_id: storeId,
          instagram_page_id: data.instagram_page_id,
          manychat_page_id: data.bot_id,
          page_name: data.page_name,
          access_token: data.access_token,
          manychat_api_key: data.access_token, // Using access token as API key
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      onConnectionSuccess(connection);
      toast({
        title: "Successfully Connected!",
        description: `Connected ${data.page_name} to ManyChat automation.`,
      });

    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to complete ManyChat connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting your ManyChat account...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ManyChatOAuthHandler;
