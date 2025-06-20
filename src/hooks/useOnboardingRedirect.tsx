
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSeller } from '@/contexts/SellerContext';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboardingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { sellerProfile, isLoading } = useSeller();

  useEffect(() => {
    if (isLoading || !user) return;

    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    const isOnboardingRoute = location.pathname === '/onboarding';

    // If user is on dashboard but has no seller profile, redirect to onboarding
    if (isDashboardRoute && !sellerProfile) {
      navigate('/onboarding', { replace: true });
    }

    // If user is on onboarding but already has a profile, redirect to dashboard
    if (isOnboardingRoute && sellerProfile) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, sellerProfile, isLoading, location.pathname, navigate]);
};
