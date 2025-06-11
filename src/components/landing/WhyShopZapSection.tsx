
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Heart, Zap } from 'lucide-react';

const WhyShopZapSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Save Time with Automation',
      description: 'No more manual replies. Our AI handles customer queries 24/7 while you focus on growing your business.',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Convert More Sales from IG',
      description: 'Turn your Instagram followers into paying customers with seamless DM-to-order automation.',
      color: 'text-green-600'
    },
    {
      icon: Heart,
      title: 'Designed for India\'s Small Sellers',
      description: 'Built with Indian entrepreneurs in mind. Hindi support, Razorpay integration, and local payment methods.',
      color: 'text-orange-600'
    },
    {
      icon: Zap,
      title: 'Runs on Auto-Pilot After Setup',
      description: 'Set it once, forget it forever. Your store works even while you sleep, converting visitors into customers.',
      color: 'text-purple-600'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-jakarta mb-4">
              Why Choose ShopZap?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're not just another e-commerce platform. We're your growth partner.
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${benefit.color} bg-current/10`}>
                        <Icon className={`w-6 h-6 ${benefit.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-jakarta mb-3">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
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

export default WhyShopZapSection;
