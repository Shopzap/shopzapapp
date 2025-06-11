
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import WhyShopZapSection from '@/components/landing/WhyShopZapSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FooterSection from '@/components/landing/FooterSection';

console.log('Index.tsx: Loading Index page');

const Index = () => {
  console.log('Index.tsx: Rendering Index component');
  
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <WhyShopZapSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default Index;
