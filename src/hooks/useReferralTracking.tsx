
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReferralTracking = () => {
  useEffect(() => {
    const trackReferral = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referrerUsername = urlParams.get('ref');
      
      if (!referrerUsername) return;
      
      // Check if we already tracked this session
      const sessionId = sessionStorage.getItem('referral_session_id') || 
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const existingReferral = sessionStorage.getItem('referral_tracked');
      if (existingReferral === referrerUsername) return;
      
      try {
        // Get referrer store ID
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('username', referrerUsername)
          .single();
        
        if (!store) return;
        
        // Check if self-referral (current user is the referrer)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userStore } = await supabase
            .from('stores')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (userStore?.id === store.id) return; // Prevent self-referral
        }
        
        // Track the referral
        const { error } = await supabase
          .from('referrals')
          .insert({
            referrer_store_id: store.id,
            session_id: sessionId,
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip)
              .catch(() => null),
            user_agent: navigator.userAgent,
            status: 'visited'
          });
        
        if (!error) {
          sessionStorage.setItem('referral_session_id', sessionId);
          sessionStorage.setItem('referral_tracked', referrerUsername);
        }
      } catch (error) {
        console.error('Error tracking referral:', error);
      }
    };
    
    trackReferral();
  }, []);
};
