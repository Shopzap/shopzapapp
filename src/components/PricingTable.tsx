
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "₹0",
    period: "forever",
    features: [
      "Up to 5 products",
      "WhatsApp checkout",
      "Basic store theme",
      "Custom domain",
      "Mobile-optimized pages",
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
    popular: false
  },
  {
    name: "Pro",
    description: "For growing businesses",
    price: "₹3,999",
    period: "per year",
    features: [
      "Unlimited products",
      "CSV & Sheets sync",
      "Custom themes",
      "Order notifications",
      "WhatsApp templates",
      "Priority support",
      "Remove ShopZap branding"
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
    popular: true
  },
  {
    name: "Premium",
    description: "For serious sellers",
    price: "₹6,999",
    period: "per year",
    features: [
      "Everything in Pro",
      "Shiprocket integration",
      "Abandoned cart recovery",
      "Detailed analytics",
      "Custom WhatsApp flows",
      "Product variants",
      "API access"
    ],
    buttonText: "Upgrade to Premium",
    buttonVariant: "outline",
    popular: false
  }
];

const PricingTable = () => {
  return (
    <section id="pricing" className="section">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> / {plan.period}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check size={18} className="text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.buttonVariant === 'default' ? 'default' : 'outline'} className="w-full">
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center bg-accent/50 p-6 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-3">Looking for a lifetime deal?</h3>
          <p className="text-muted-foreground mb-4">Get unlimited access to Pro features with a one-time payment.</p>
          <Button variant="outline">
            Get Lifetime Access for ₹4,000
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
