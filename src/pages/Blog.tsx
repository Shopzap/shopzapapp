
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How to Start Your WhatsApp Business in 2024",
      excerpt: "Learn the complete guide to starting a successful WhatsApp business with ShopZap. From setup to your first sale.",
      author: "ShopZap Team",
      date: "2024-01-15",
      category: "Getting Started",
      image: "/placeholder.svg",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "10 Best Practices for WhatsApp Commerce",
      excerpt: "Discover proven strategies to increase sales and customer satisfaction through WhatsApp commerce.",
      author: "Marketing Team",
      date: "2024-01-10",
      category: "Marketing",
      image: "/placeholder.svg",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Customer Success Story: From Zero to ₹1 Lakh Monthly",
      excerpt: "Read how Priya transformed her small business into a thriving WhatsApp store using ShopZap.",
      author: "Customer Success",
      date: "2024-01-05",
      category: "Success Stories",
      image: "/placeholder.svg",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "WhatsApp Business API: Everything You Need to Know",
      excerpt: "Understand the benefits of WhatsApp Business API and how it can scale your business operations.",
      author: "Technical Team",
      date: "2024-01-01",
      category: "Technical",
      image: "/placeholder.svg",
      readTime: "8 min read"
    },
    {
      id: 5,
      title: "Product Photography Tips for Better Sales",
      excerpt: "Simple photography techniques to make your products more appealing and increase conversion rates.",
      author: "Design Team",
      date: "2023-12-28",
      category: "Tips",
      image: "/placeholder.svg",
      readTime: "6 min read"
    },
    {
      id: 6,
      title: "Building Customer Trust in Online Commerce",
      excerpt: "Learn how to build trust with your customers and create long-lasting business relationships.",
      author: "Business Team",
      date: "2023-12-25",
      category: "Business",
      image: "/placeholder.svg",
      readTime: "5 min read"
    }
  ];

  const categories = ["All", "Getting Started", "Marketing", "Success Stories", "Technical", "Tips", "Business"];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                ShopZap Blog
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Tips, guides, and insights to help you grow your WhatsApp business
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge 
                  key={category} 
                  variant={category === "All" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={blogPosts[0].image} 
                      alt={blogPosts[0].title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <Badge className="mb-4">{blogPosts[0].category}</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                      <User className="h-4 w-4 mr-2" />
                      <span className="mr-4">{blogPosts[0].author}</span>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="mr-4">{blogPosts[0].date}</span>
                      <span>{blogPosts[0].readTime}</span>
                    </div>
                    <Button>
                      Read More <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Latest Articles</h2>
              <p className="text-muted-foreground">
                Stay updated with the latest tips and insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <User className="h-4 w-4 mr-2" />
                      <span className="mr-4">{post.author}</span>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{post.date}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to our newsletter for the latest tips, guides, and business insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-border rounded-md"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
