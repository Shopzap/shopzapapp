
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Book, MessageCircle, Video, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Help = () => {
  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of setting up your store',
      articles: [
        'How to create your first store',
        'Adding products to your catalog',
        'Setting up Instagram automation',
        'Configuring payment methods'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Instagram Automation',
      description: 'Master DM automation and customer engagement',
      articles: [
        'Setting up keyword triggers',
        'Creating auto-reply templates',
        'Managing customer conversations',
        'Analytics for DM performance'
      ]
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      articles: [
        'Store setup walkthrough',
        'Instagram integration guide',
        'Product management tutorial',
        'Analytics dashboard overview'
      ]
    },
    {
      icon: FileText,
      title: 'Store Management',
      description: 'Manage orders, inventory, and customers',
      articles: [
        'Processing and tracking orders',
        'Managing inventory levels',
        'Customer support best practices',
        'Store customization options'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I connect my Instagram account?',
      answer: 'Go to Settings > Integrations > Instagram and follow the simple authorization process. You\'ll need a business Instagram account.'
    },
    {
      question: 'Can I customize the automated replies?',
      answer: 'Yes, you can create custom templates and set keyword triggers. We also provide pre-made templates in Hindi and English.'
    },
    {
      question: 'How many products can I add?',
      answer: 'Free plan allows up to 10 products. Pro plan has unlimited products. You can upgrade anytime.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures. Your data is stored securely and never shared with third parties.'
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
              How Can We{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Help You?
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Find answers to your questions and learn how to make the most of ShopZap.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold font-jakarta text-center mb-12">Browse Help Topics</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="font-jakarta">{category.title}</CardTitle>
                          <p className="text-muted-foreground text-sm">{category.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <a href="#" className="text-primary hover:underline text-sm">
                              {article}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-jakarta text-center mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold font-jakarta mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center mt-16">
              <h3 className="text-2xl font-bold font-jakarta mb-4">Still need help?</h3>
              <p className="text-muted-foreground mb-6">Can't find what you're looking for? Our support team is here to help.</p>
              <Button asChild size="lg">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Help;
