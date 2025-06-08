
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const StoreThemes = () => {
  const themes = [
    {
      id: 1,
      name: "Modern Minimal",
      description: "Clean and minimalist design perfect for fashion and lifestyle brands",
      image: "/placeholder.svg",
      category: "Fashion",
      features: ["Responsive Design", "Mobile Optimized", "Fast Loading"]
    },
    {
      id: 2,
      name: "Tech Store",
      description: "Professional layout ideal for electronics and gadgets",
      image: "/placeholder.svg",
      category: "Electronics",
      features: ["Product Gallery", "Spec Comparison", "Tech Focused"]
    },
    {
      id: 3,
      name: "Food & Beverage",
      description: "Appetizing design for restaurants and food delivery",
      image: "/placeholder.svg",
      category: "Food",
      features: ["Menu Display", "Order Tracking", "Delivery Integration"]
    },
    {
      id: 4,
      name: "Handmade Crafts",
      description: "Artistic layout for handmade and artisan products",
      image: "/placeholder.svg",
      category: "Crafts",
      features: ["Gallery View", "Story Telling", "Artisan Profile"]
    },
    {
      id: 5,
      name: "Professional Services",
      description: "Corporate design for service-based businesses",
      image: "/placeholder.svg",
      category: "Services",
      features: ["Service Catalog", "Booking System", "Client Testimonials"]
    },
    {
      id: 6,
      name: "Fitness & Health",
      description: "Energetic design for fitness and wellness brands",
      image: "/placeholder.svg",
      category: "Health",
      features: ["Program Display", "Progress Tracking", "Community Features"]
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
                Beautiful Store Themes
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Choose from our collection of professionally designed themes to make your WhatsApp store stand out
              </p>
              <Button asChild size="lg" className="mr-4">
                <Link to="/dashboard">Start Customizing</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Themes Gallery */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Perfect Theme</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                All themes are fully responsive, mobile-optimized, and designed to convert visitors into customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={theme.image} 
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4">
                      {theme.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {theme.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" asChild>
                      <Link to="/dashboard">Use This Theme</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Themes?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
                <p className="text-muted-foreground">
                  All themes are optimized for mobile devices and WhatsApp integration
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Optimized for speed to ensure your customers don't wait
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
                <p className="text-muted-foreground">
                  Customize colors, fonts, and layouts to match your brand
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StoreThemes;
