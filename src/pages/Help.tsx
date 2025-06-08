
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Help = () => {
  const faqs = [
    {
      question: "How do I create my first store?",
      answer: "Sign up for a ShopZap account, go through our onboarding process, and use the store builder to customize your store appearance and add products."
    },
    {
      question: "How does WhatsApp integration work?",
      answer: "Customers can browse your products on your ShopZap store and place orders directly through WhatsApp. Orders are automatically forwarded to your WhatsApp number."
    },
    {
      question: "Can I customize my store design?",
      answer: "Yes! You can customize colors, fonts, layout, add your logo, and choose from various themes to match your brand."
    },
    {
      question: "How do I track my orders?",
      answer: "Use the Orders section in your dashboard to view all incoming orders, update order status, and track customer communications."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support UPI, credit/debit cards, net banking, and digital wallets through Razorpay integration."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, ShopZap is a web-based platform optimized for mobile browsers. A dedicated mobile app is coming soon."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of setting up your store",
      icon: <Book className="h-6 w-6" />,
      link: "/tutorials"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: <Video className="h-6 w-6" />,
      link: "/tutorials"
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <Mail className="h-6 w-6" />,
      link: "mailto:support@shopzap.io"
    },
    {
      title: "Community Chat",
      description: "Join our user community",
      icon: <MessageCircle className="h-6 w-6" />,
      link: "#"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Help Center
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Find answers to your questions and get the most out of ShopZap
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for help..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Resources */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Quick Resources</h2>
              <p className="text-muted-foreground">
                Find the help you need quickly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      {resource.icon}
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={resource.link}>Access</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions and answers about ShopZap
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground mb-8">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="mailto:support@shopzap.io">Email Support</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/tutorials">Browse Tutorials</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
