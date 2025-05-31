
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import PricingTable from '@/components/PricingTable';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <PricingTable />
      </main>
      <Footer />
    </div>
  );
}
