
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { constructOAuthUrl, validateSupabaseSession, type OAuthState } from "@/utils/instagramAuth";

export const useInstagramAuth = () => {
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initiateOAuthRedirect = async () => {
      try {
        setIsRedirecting(true);
        setError(null);

        console.log('Starting Instagram OAuth process...');

        const sessionValidation = await validateSupabaseSession(supabase);
        
        if (!sessionValidation.isValid) {
          setError(sessionValidation.error || 'Session validation failed');
          setIsRedirecting(false);
          return;
        }

        const { user, store } = sessionValidation;

        const { data: existingConnection } = await supabase
          .from('instagram_connections')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true)
          .maybeSingle();

        if (existingConnection) {
          toast({
            title: "Already Connected",
            description: `Instagram account @${existingConnection.ig_username} is already connected.`,
            variant: "destructive"
          });
          navigate('/dashboard/instagram-automation');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        const { data: secretData, error: secretError } = await supabase.functions.invoke('get-sendpulse-config', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });

        if (secretError || !secretData?.client_id) {
          console.error('Failed to get SendPulse client ID:', secretError);
          setError('SendPulse configuration error. Please contact support.');
          setIsRedirecting(false);
          return;
        }

        setClientId(secretData.client_id);

        const oauthState: OAuthState = {
          store_id: store.id,
          user_id: user.id,
          timestamp: Date.now()
        };

        const oauthUrl = constructOAuthUrl(secretData.client_id, oauthState);

        console.log('Initiating OAuth redirect to SendPulse...');

        setTimeout(() => {
          window.location.href = oauthUrl;
        }, 1500);

      } catch (err) {
        console.error('OAuth redirect error:', err);
        setError('Failed to initiate Instagram authorization. Please try again.');
        setIsRedirecting(false);
        
        toast({
          title: "Authorization Error",
          description: "Failed to redirect to Instagram authorization. Please try again.",
          variant: "destructive"
        });
      }
    };

    initiateOAuthRedirect();
  }, [toast, navigate, retryCount]);

  const handleRetry = () => {
    setIsRedirecting(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const handleManualRedirect = async () => {
    if (!clientId) {
      toast({
        title: "Client ID not available",
        description: "Please retry the authorization first to fetch the necessary configuration.",
        variant: "destructive"
      });
      return;
    }

    try {
      const sessionValidation = await validateSupabaseSession(supabase);
      
      if (!sessionValidation.isValid) {
        setError(sessionValidation.error);
        toast({
          title: "Session Error",
          description: sessionValidation.error || 'Session validation failed.',
          variant: "destructive"
        });
        return;
      }

      const { user, store } = sessionValidation;

      const oauthState: OAuthState = {
        store_id: store.id,
        user_id: user.id,
        timestamp: Date.now()
      };

      const oauthUrl = constructOAuthUrl(clientId, oauthState);
      
      window.open(oauthUrl, '_blank');
    } catch (err) {
      console.error('Manual redirect error:', err);
      toast({
        title: "Redirect Failed",
        description: "Unable to open authorization page. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard/instagram-automation');
  };

  return {
    isRedirecting,
    error,
    handleRetry,
    handleManualRedirect,
    handleGoToDashboard
  };
};
