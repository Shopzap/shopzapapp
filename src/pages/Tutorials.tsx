
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Tutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with ShopZap",
      description: "Complete walkthrough of setting up your first WhatsApp store",
      duration: "15 min",
      level: "Beginner",
      views: "2.5k",
      thumbnail: "/placeholder.svg",
      lessons: 5
    },
    {
      id: 2,
      title: "Adding and Managing Products",
      description: "Learn how to add products, set prices, and manage inventory",
      duration: "12 min",
      level: "Beginner",
      views: "1.8k",
      thumbnail: "/placeholder.svg",
      lessons: 4
    },
    {
      id: 3,
      title: "Customizing Your Store Design",
      description: "Make your store stand out with custom themes and branding",
      duration: "18 min",
      level: "Intermediate",
      views: "1.2k",
      thumbnail: "/placeholder.svg",
      lessons: 6
    },
    {
      id: 4,
      title: "WhatsApp Integration Setup",
      description: "Connect your WhatsApp number and configure automated messages",
      duration: "10 min",
      level: "Beginner",
      views: "3.1k",
      thumbnail: "/placeholder.svg",
      lessons: 3
    },
    {
      id: 5,
      title: "Payment Gateway Configuration",
      description: "Set up Razorpay and other payment methods for your store",
      duration: "14 min",
      level: "Intermediate",
      views: "950",
      thumbnail: "/placeholder.svg",
      lessons: 4
    },
    {
      id: 6,
      title: "Analytics and Performance Tracking",
      description: "Understand your store analytics and optimize for better sales",
      duration: "20 min",
      level: "Advanced",
      views: "750",
      thumbnail: "/placeholder.svg",
      lessons: 7
    }
  ];

  const quickGuides = [
    {
      title: "How to add your first product",
      time: "2 min read",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      title: "Setting up WhatsApp notifications",
      time: "3 min read",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      title: "Customizing store colors",
      time: "1 min read",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      title: "Managing customer orders",
      time: "4 min read",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
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
                Learn ShopZap
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Master WhatsApp commerce with our step-by-step video tutorials and guides
              </p>
              <Button asChild size="lg">
                <Link to="/dashboard">Start Building</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Guides */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Quick Start Guides</h2>
              <p className="text-muted-foreground">
                Get up and running quickly with these bite-sized tutorials
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {quickGuides.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      {guide.icon}
                      <div>
                        <h3 className="font-semibold mb-1">{guide.title}</h3>
                        <p className="text-sm text-muted-foreground">{guide.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Video Tutorials</h2>
              <p className="text-muted-foreground">
                Comprehensive video guides to help you master every feature
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="h-6 w-6 text-primary" fill="currentColor" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2">
                      {tutorial.level}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {tutorial.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{tutorial.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{tutorial.views}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tutorial.lessons} lessons
                    </p>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Recommended Learning Path</h2>
              <p className="text-muted-foreground">
                Follow this sequence for the best learning experience
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                {[
                  "1. Getting Started with ShopZap",
                  "2. Adding and Managing Products", 
                  "3. WhatsApp Integration Setup",
                  "4. Customizing Your Store Design",
                  "5. Payment Gateway Configuration",
                  "6. Analytics and Performance Tracking"
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{step.substring(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
              <p className="text-muted-foreground mb-8">
                Can't find what you're looking for? We're here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/help">Visit Help Center</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="mailto:support@shopzap.io">Contact Support</a>
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

export default Tutorials;
