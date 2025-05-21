
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract hash fragment from URL (Supabase adds auth data as a hash fragment)
    const hashFragment = window.location.hash;
    
    const handleAuthCallback = async () => {
      try {
        // If there's a hash fragment, process it
        if (hashFragment) {
          // Supabase can automatically parse the hash
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            toast.error('Authentication failed');
            navigate('/auth');
            return;
          }
          
          if (data?.session) {
            console.log('Auth callback successful, session retrieved');
            toast.success('Successfully authenticated');
            navigate('/dashboard');
          } else {
            // No session was found, redirect to auth page
            navigate('/auth');
          }
        } else {
          // No hash fragment found, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        toast.error('Authentication failed');
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-center">Completing authentication...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
