
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const Verify = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Extract token and type from the URL params
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const type = params.get('type');

        // Make sure we have the required parameters
        if (!token || !type) {
          setError('Missing verification parameters');
          setVerificationStatus('error');
          return;
        }

        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any // The type can be 'signup', 'recovery', etc.
        });

        if (error) {
          console.error('Verification error:', error);
          setError(error.message);
          setVerificationStatus('error');
          toast.error('Email verification failed');
        } else {
          setVerificationStatus('success');
          toast.success('Email verified successfully');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (err: any) {
        console.error('Verification exception:', err);
        setError(err.message || 'An unexpected error occurred');
        setVerificationStatus('error');
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been verified successfully!'}
            {verificationStatus === 'error' && 'There was a problem verifying your email.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {verificationStatus === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          
          {verificationStatus === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          
          {verificationStatus === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {verificationStatus === 'success' && (
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          )}
          
          {verificationStatus === 'error' && (
            <div className="flex flex-col gap-2 w-full">
              <Button variant="default" onClick={() => navigate('/auth')}>
                Return to Login
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Verify;
