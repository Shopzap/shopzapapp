
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const InstagramAuth = () => {
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initiateOAuthRedirect = () => {
      try {
        // Get SendPulse Client ID from environment
        const clientId = import.meta.env.VITE_SENDPULSE_CLIENT_ID;
        
        if (!clientId) {
          setError('SendPulse Client ID is not configured. Please contact support.');
          setIsRedirecting(false);
          return;
        }

        // Construct OAuth URL
        const redirectUri = 'https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback';
        const scope = 'chatbots user_data';
        const state = 'xyz123'; // Simple state for verification
        
        const oauthUrl = new URL('https://oauth.sendpulse.com/authorize');
        oauthUrl.searchParams.set('client_id', clientId);
        oauthUrl.searchParams.set('redirect_uri', redirectUri);
        oauthUrl.searchParams.set('response_type', 'code');
        oauthUrl.searchParams.set('scope', scope);
        oauthUrl.searchParams.set('state', state);

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
  }, [toast]);

  const handleManualRedirect = () => {
    setIsRedirecting(true);
    setError(null);
    
    // Retry the redirect process
    setTimeout(() => {
      const clientId = import.meta.env.VITE_SENDPULSE_CLIENT_ID;
      if (clientId) {
        const redirectUri = 'https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback';
        const scope = 'chatbots user_data';
        const state = 'xyz123';
        
        const oauthUrl = new URL('https://oauth.sendpulse.com/authorize');
        oauthUrl.searchParams.set('client_id', clientId);
        oauthUrl.searchParams.set('redirect_uri', redirectUri);
        oauthUrl.searchParams.set('response_type', 'code');
        oauthUrl.searchParams.set('scope', scope);
        oauthUrl.searchParams.set('state', state);

        window.location.href = oauthUrl.toString();
      }
    }, 500);
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
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Having trouble? Try the manual redirect below.
                </p>
                <Button 
                  onClick={handleManualRedirect}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!import.meta.env.VITE_SENDPULSE_CLIENT_ID}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Authorize Instagram Account
                </Button>
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
