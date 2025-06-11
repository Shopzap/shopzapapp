
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import WhyShopZapSection from '@/components/landing/WhyShopZapSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FooterSection from '@/components/landing/FooterSection';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <WhyShopZapSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
