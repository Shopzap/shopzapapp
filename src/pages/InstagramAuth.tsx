
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram } from 'lucide-react';
import { useInstagramAuth } from '@/hooks/useInstagramAuth';
import InstagramAuthRedirecting from '@/components/instagram/auth/InstagramAuthRedirecting';
import InstagramAuthError from '@/components/instagram/auth/InstagramAuthError';
import InstagramAuthNextSteps from '@/components/instagram/auth/InstagramAuthNextSteps';

const InstagramAuth = () => {
  const {
    isRedirecting,
    error,
    handleRetry,
    handleManualRedirect,
    handleGoToDashboard,
  } = useInstagramAuth();

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
            <InstagramAuthRedirecting />
          ) : error ? (
            <InstagramAuthError 
              error={error}
              onRetry={handleRetry}
              onManualRedirect={handleManualRedirect}
              onGoToDashboard={handleGoToDashboard}
            />
          ) : null}

          <InstagramAuthNextSteps />

          <div className="text-center text-xs text-gray-500">
            Need help? <a href="/help" className="text-purple-600 hover:underline">Contact Support</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramAuth;
