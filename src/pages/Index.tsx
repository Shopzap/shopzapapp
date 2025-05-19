
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import PricingTable from '@/components/PricingTable';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      
      {/* How it works section */}
      <section className="section">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your WhatsApp store up and running in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Store</h3>
              <p className="text-muted-foreground">Add your store name, WhatsApp number, and logo to generate your unique store URL.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Add Products</h3>
              <p className="text-muted-foreground">Upload products manually, import via CSV, or connect your Google Sheet for auto-sync.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Selling</h3>
              <p className="text-muted-foreground">Share your store link and receive orders directly to your WhatsApp with all details.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button size="lg" asChild>
              <Link to="/onboarding">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Features />
      
      {/* Testimonials placeholder */}
      <section className="section bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Businesses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of sellers already using ShopZap to power their WhatsApp sales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background border p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah J.</h4>
                  <p className="text-muted-foreground text-sm">Fashion Boutique Owner</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "ShopZap transformed my side hustle into a real business. Now I get orders 24/7 without any technical hassles."
              </p>
            </div>
            
            <div className="bg-background border p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Raj M.</h4>
                  <p className="text-muted-foreground text-sm">Electronics Store</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "My customers love how easy it is to browse products and place orders via WhatsApp. Sales are up 45% since switching!"
              </p>
            </div>
            
            <div className="bg-background border p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Priya K.</h4>
                  <p className="text-muted-foreground text-sm">Handmade Jewelry</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As someone with zero tech skills, this was a game-changer. Set up my store in 10 minutes and got my first sale that day!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <PricingTable />
      
      {/* CTA Section */}
      <section className="section bg-primary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Zap Your Products into a Store?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of sellers who are growing their business with WhatsApp-powered stores.
          </p>
          <Button size="lg" asChild className="btn-hover">
            <Link to="/onboarding">Create Your Store Now</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
