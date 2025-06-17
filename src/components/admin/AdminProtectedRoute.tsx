
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

const ADMIN_EMAILS = ['shaikhsadique730@gmail.com', 'shaikhumairthisside@gmail.com'];

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userEmail = session.user.email;
          const isAdminEmail = ADMIN_EMAILS.includes(userEmail || '');
          
          setIsAuthenticated(true);
          setIsAuthorized(isAdminEmail);
          
          if (isAdminEmail) {
            // Update admin session
            localStorage.setItem('admin_session', JSON.stringify({
              user: session.user,
              timestamp: Date.now()
            }));
          }
        } else {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          localStorage.removeItem('admin_session');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setIsAuthorized(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAuthorized(false);
        localStorage.removeItem('admin_session');
      } else if (session?.user) {
        const isAdminEmail = ADMIN_EMAILS.includes(session.user.email || '');
        setIsAuthenticated(true);
        setIsAuthorized(isAdminEmail);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
