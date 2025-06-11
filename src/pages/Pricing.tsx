
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 products',
        'Basic store customization',
        'Instagram DM automation (50 DMs/month)',
        'Basic analytics',
        'Email support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹499',
      period: 'per month',
      description: 'Best for growing businesses',
      features: [
        'Unlimited products',
        'Advanced store customization',
        'Unlimited Instagram automation',
        'Advanced analytics & insights',
        'Priority support',
        'Custom domain',
        'Bulk product upload',
        'Advanced keyword triggers'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large businesses',
      features: [
        'Everything in Pro',
        'Multiple store management',
        'Team collaboration tools',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'Advanced API access',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-jakarta mb-6">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your business. Start free and upgrade as you grow.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl font-bold font-jakarta mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Link to={plan.name === 'Enterprise' ? '/contact' : '/dashboard'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* FAQ Section */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold font-jakarta mb-8">Frequently Asked Questions</h3>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
                  <p className="text-muted-foreground text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Is there a setup fee?</h4>
                  <p className="text-muted-foreground text-sm">No, there are no setup fees or hidden charges. You only pay for your monthly subscription.</p>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-muted-foreground text-sm">We accept all major credit cards, UPI, and net banking through Razorpay.</p>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                  <p className="text-muted-foreground text-sm">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Pricing;
