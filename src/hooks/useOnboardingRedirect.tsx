
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

    // If user is on dashboard but has no seller profile or incomplete onboarding
    if (isDashboardRoute && (!sellerProfile || !sellerProfile.is_onboarding_complete)) {
      navigate('/onboarding', { replace: true });
    }

    // If user is on onboarding but already has complete profile
    if (isOnboardingRoute && sellerProfile?.is_onboarding_complete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, sellerProfile, isLoading, location.pathname, navigate]);
};
