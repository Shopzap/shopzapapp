
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "ShopZap helped me get orders from Reels without replying manually. My sales doubled in just one month!",
      name: "Priya Sharma",
      role: "Fashion Reseller, Delhi",
      rating: 5
    },
    {
      quote: "Store + automation + payment — all in one place! Finally, a platform made for Indian sellers like me.",
      name: "Rajesh Kumar",
      role: "Electronics Seller, Mumbai",
      rating: 5
    },
    {
      quote: "The Hindi template responses are a game-changer. My customers love the personal touch and quick replies.",
      name: "Sneha Patel",
      role: "Handmade Jewelry, Ahmedabad",
      rating: 5
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-jakarta mb-4">
              What Our Sellers Say
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful entrepreneurs who've grown their business with ShopZap
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <div>
                    <p className="font-semibold font-jakarta">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
