
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Store, Package, MessageSquare } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Store,
      title: 'Create Your Store',
      description: 'Set up your online store in seconds with our simple builder',
      step: '01'
    },
    {
      icon: Package,
      title: 'Add Products',
      description: 'Upload your products with photos, prices, and descriptions',
      step: '02'
    },
    {
      icon: MessageSquare,
      title: 'Turn On Auto-DM',
      description: 'Convert Instagram DMs into orders automatically',
      step: '03'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-jakarta mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your business online and automate your Instagram sales in just 3 simple steps
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-background">
                  <CardContent className="p-8 text-center">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold font-jakarta mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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

export default HowItWorksSection;
