
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  MessageSquare, 
  Zap, 
  Package, 
  BarChart3, 
  Link, 
  MessageCircle, 
  CreditCard, 
  Smartphone, 
  Shield 
} from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Store,
      title: 'Instant Storefront Builder',
      description: 'Create beautiful stores in seconds'
    },
    {
      icon: MessageSquare,
      title: 'IG DM Automation',
      description: 'Auto-reply to Instagram messages'
    },
    {
      icon: Zap,
      title: 'Keyword-based Reply Flows',
      description: 'Smart responses based on keywords'
    },
    {
      icon: Package,
      title: 'Product Manager',
      description: 'Easy product catalog management'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track sales and performance'
    },
    {
      icon: Link,
      title: 'Reels → Product Link',
      description: 'Convert reels into sales'
    },
    {
      icon: MessageCircle,
      title: 'Desi Reply Templates',
      description: 'Hindi & Hinglish support'
    },
    {
      icon: CreditCard,
      title: 'Razorpay Payments',
      description: 'Secure Indian payment gateway'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Perfect on all devices'
    },
    {
      icon: Shield,
      title: 'No-Code Hosting',
      description: 'Zero technical setup required'
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-jakarta mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for Indian entrepreneurs and small businesses
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-background">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold font-jakarta mb-2 text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
