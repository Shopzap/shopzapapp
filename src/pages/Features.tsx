
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  MessageSquare, 
  Zap, 
  Package, 
  BarChart3, 
  Link2, 
  MessageCircle, 
  CreditCard, 
  Smartphone, 
  Shield 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Store,
      title: 'Instant Storefront Builder',
      description: 'Create beautiful, professional online stores in seconds with our drag-and-drop builder. No coding skills required.',
      color: 'text-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Instagram DM Automation',
      description: 'Automatically respond to Instagram DMs and comments with smart, contextual replies that convert followers into customers.',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Keyword-based Reply Flows',
      description: 'Set up intelligent keyword triggers that automatically send the right product information to interested customers.',
      color: 'text-yellow-600'
    },
    {
      icon: Package,
      title: 'Product Manager',
      description: 'Easily manage your entire product catalog with bulk upload, inventory tracking, and automatic sync across platforms.',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your sales performance, customer engagement, and automation metrics with detailed analytics and insights.',
      color: 'text-red-600'
    },
    {
      icon: Link2,
      title: 'Reels → Product Link',
      description: 'Convert your Instagram Reels into sales with direct product links and automated order processing.',
      color: 'text-indigo-600'
    },
    {
      icon: MessageCircle,
      title: 'Desi Reply Templates',
      description: 'Pre-built templates in Hindi and Hinglish to connect with your Indian audience in their preferred language.',
      color: 'text-orange-600'
    },
    {
      icon: CreditCard,
      title: 'Razorpay Payments',
      description: 'Secure payment processing with Razorpay integration supporting UPI, cards, wallets, and net banking.',
      color: 'text-teal-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Your store looks perfect on all devices with responsive design optimized for mobile shopping experiences.',
      color: 'text-pink-600'
    },
    {
      icon: Shield,
      title: 'No-Code Hosting',
      description: 'Your store is automatically hosted on our secure, fast servers with SSL certificates and 99.9% uptime.',
      color: 'text-cyan-600'
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
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Modern Sellers
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, automate, and scale your online business with Instagram integration.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} bg-current/10`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-jakarta mb-3">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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

      <FooterSection />
    </div>
  );
};

export default Features;
