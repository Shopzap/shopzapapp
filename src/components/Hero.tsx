
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-background -z-10"></div>
      
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Zap Your Products</span> into a Store. Sell on WhatsApp. Instantly.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-lg">
              Turn your WhatsApp into a powerful online store. No coding, no website needed. Just add products and start selling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button size="lg" asChild className="btn-hover">
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="btn-hover">
                  <Link to="/onboarding">Create Your Store</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="btn-hover">
                <a href="#features">See How It Works</a>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative p-4 bg-white rounded-xl shadow-xl border animate-float max-w-md mx-auto">
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <div className="h-8 w-8 bg-primary rounded-full mb-2"></div>
                <div className="h-4 w-3/4 bg-primary/30 rounded-full mb-2"></div>
                <div className="h-4 w-1/2 bg-primary/30 rounded-full"></div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <div className="h-32 bg-accent rounded-lg mb-2"></div>
                  <div className="h-4 bg-muted rounded-full mb-1"></div>
                  <div className="h-4 w-2/3 bg-muted rounded-full"></div>
                </div>
                <div className="w-1/2">
                  <div className="h-32 bg-accent rounded-lg mb-2"></div>
                  <div className="h-4 bg-muted rounded-full mb-1"></div>
                  <div className="h-4 w-2/3 bg-muted rounded-full"></div>
                </div>
              </div>
              
              <div className="h-12 bg-primary rounded-lg flex items-center justify-center text-white font-medium">
                Buy via WhatsApp
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-10 transform rotate-6 w-20 h-20 bg-white p-1 rounded-xl shadow-lg border">
              <div className="bg-green-500 h-full w-full rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5"></path>
                </svg>
              </div>
            </div>
            
            <div className="absolute -left-4 top-10 transform -rotate-6 bg-white p-3 rounded-xl shadow-lg border">
              <div className="h-4 w-20 bg-muted rounded-full mb-2"></div>
              <div className="h-4 w-16 bg-primary/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
