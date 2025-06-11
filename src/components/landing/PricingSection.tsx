
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-jakarta mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, scale when you're ready. No hidden fees, no surprises.
            </p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-muted shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-jakarta">Free Plan</CardTitle>
                  <Badge variant="secondary">Popular</Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Up to 10 products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Basic IG automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Razorpay integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Mobile-ready store</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard">
                    Get Started Free
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-xl transform scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-jakarta">Pro Plan</CardTitle>
                  <Badge>Coming Soon</Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Unlimited products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Advanced IG automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Custom domain</span>
                  </li>
                </ul>
                <Button className="w-full" disabled>
                  Notify When Available
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="text-lg px-8 py-6 font-semibold">
              <Link to="/dashboard" className="flex items-center gap-2">
                Start for Free Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              No credit card required • Setup in 2 minutes • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
