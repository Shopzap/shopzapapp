
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'support@shopzap.io',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 98765 43210',
      description: 'Call us during business hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: 'Mumbai, Maharashtra, India',
      description: 'Our headquarters'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      details: 'Mon-Fri 9AM-6PM IST',
      description: 'We\'re here to help'
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
              Get In{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-jakarta">Send us a message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Your last name" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this regarding?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your question or feedback..."
                      rows={6}
                    />
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold font-jakarta mb-4">Contact Information</h2>
                  <p className="text-muted-foreground">
                    Choose the best way to reach us. We're always happy to help!
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <Card key={index} className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold font-jakarta mb-1">{info.title}</h3>
                              <p className="text-lg font-medium mb-1">{info.details}</p>
                              <p className="text-muted-foreground text-sm">{info.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Quick Links */}
                <Card className="border-0 shadow-md bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-semibold font-jakarta mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <p>
                        <a href="#" className="text-primary hover:underline">Knowledge Base</a> - 
                        Find answers to common questions
                      </p>
                      <p>
                        <a href="#" className="text-primary hover:underline">Video Tutorials</a> - 
                        Learn with step-by-step guides
                      </p>
                      <p>
                        <a href="#" className="text-primary hover:underline">Community Forum</a> - 
                        Connect with other users
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Contact;
