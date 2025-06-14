
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InstagramAuth = () => {
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initiateOAuthRedirect = async () => {
      try {
        // Get authenticated user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session?.user) {
          setError('You must be logged in to connect Instagram. Please sign in first.');
          setIsRedirecting(false);
          return;
        }

        const userId = sessionData.session.user.id;

        // Get user's store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, user_id')
          .eq('user_id', userId)
          .single();

        if (storeError || !storeData) {
          setError('Store not found. Please complete seller onboarding first.');
          setIsRedirecting(false);
          return;
        }

        // Check if Instagram is already connected
        const { data: existingConnection } = await supabase
          .from('instagram_connections')
          .select('*')
          .eq('store_id', storeData.id)
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

        // Get SendPulse Client ID from Supabase secrets via edge function
        const { data: secretData, error: secretError } = await supabase.functions.invoke('get-sendpulse-config', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`
          }
        });

        if (secretError || !secretData?.client_id) {
          console.error('Failed to get SendPulse client ID:', secretError);
          setError('SendPulse configuration error. Please contact support.');
          setIsRedirecting(false);
          return;
        }

        // Create state parameter with store and user info
        const stateData = {
          store_id: storeData.id,
          user_id: userId,
          timestamp: Date.now()
        };
        const state = btoa(JSON.stringify(stateData));
        
        // Construct OAuth URL with production parameters
        const redirectUri = 'https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback';
        const scope = 'chatbots,user_data';
        
        const oauthUrl = new URL('https://oauth.sendpulse.com/authorize');
        oauthUrl.searchParams.set('client_id', secretData.client_id);
        oauthUrl.searchParams.set('redirect_uri', redirectUri);
        oauthUrl.searchParams.set('response_type', 'code');
        oauthUrl.searchParams.set('scope', scope);
        oauthUrl.searchParams.set('state', state);

        console.log('Initiating OAuth redirect to SendPulse...');

        // Add a small delay for better UX
        setTimeout(() => {
          window.location.href = oauthUrl.toString();
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
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
        navigate('/auth');
        return;
      }

      // Get basic redirect with minimal params for manual fallback
      const redirectUri = 'https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback';
      const fallbackUrl = `https://oauth.sendpulse.com/authorize?response_type=code&scope=chatbots,user_data&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      window.open(fallbackUrl, '_blank');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Instagram className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Instagram Authorization</CardTitle>
          <CardDescription>
            Connecting your Instagram Business Account via SendPulse
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isRedirecting && !error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Redirecting to Instagram...</h3>
                <p className="text-sm text-gray-600 mt-2">
                  You'll be redirected to authorize your Instagram Business Account through SendPulse.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This may take a few seconds...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Having trouble? Try one of the options below:
                </p>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleRetry}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Retry Authorization
                  </Button>
                  
                  <Button 
                    onClick={handleManualRedirect}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manual Redirect
                  </Button>
                  
                  <Button 
                    onClick={handleGoToDashboard}
                    variant="ghost"
                    className="w-full text-sm"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Information section */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">What happens next?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• You'll authorize ShopZap to access your Instagram Business Account</li>
              <li>• This enables automated DM responses and comment replies</li>
              <li>• You'll be redirected back to your dashboard once complete</li>
              <li>• Your data is encrypted and stored securely</li>
            </ul>
          </div>

          {/* Support link */}
          <div className="text-center text-xs text-gray-500">
            Need help? <a href="/help" className="text-purple-600 hover:underline">Contact Support</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramAuth;
