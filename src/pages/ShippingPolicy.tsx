
import React, { useEffect, useState } from 'react';
import { ArrowUp, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'shipping-coverage', title: 'Shipping Coverage' },
    { id: 'shipping-methods', title: 'Shipping Methods' },
    { id: 'shipping-charges', title: 'Shipping Charges' },
    { id: 'order-processing', title: 'Order Processing' },
    { id: 'delivery-process', title: 'Delivery Process' },
    { id: 'order-tracking', title: 'Order Tracking' },
    { id: 'delivery-issues', title: 'Delivery Issues' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <title>Shipping & Delivery Policy - ShopZap.io | Delivery Information</title>
      <meta name="description" content="Learn about ShopZap.io's shipping policy. Average delivery times are 3-7 days. Delivery responsibility lies with individual sellers." />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📄 Shipping & Delivery Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about shipping and delivery through ShopZap stores
            </p>
            <p className="text-gray-500 mt-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Navigation Sidebar */}
            <div className="hidden lg:block w-64 sticky top-24 self-start">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="block w-full text-left text-sm text-gray-600 hover:text-primary transition-colors py-1 px-2 rounded hover:bg-white"
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <div className="prose prose-lg max-w-none">
                <section id="overview" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Overview</h2>
                  <p className="text-gray-700 leading-relaxed">
                    This Shipping & Delivery Policy applies to all orders placed through stores on the ShopZap.io platform. Individual store owners are responsible for fulfilling orders according to their specific shipping policies, which should align with these general guidelines.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                    <p className="text-blue-800 font-medium">
                      Delivery responsibility lies with individual sellers. Tracking info will be shared via email or WhatsApp.
                    </p>
                  </div>
                </section>

                <section id="shipping-coverage" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Shipping Coverage</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.1 Domestic Shipping</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">We facilitate shipping across India through our partner stores:</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">Major cities</h4>
                      <p className="text-gray-700">2-4 business days</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">Tier 2 cities</h4>
                      <p className="text-gray-700">3-6 business days</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">Remote areas</h4>
                      <p className="text-gray-700">5-10 business days</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">Kashmir, Northeast</h4>
                      <p className="text-gray-700">7-14 business days</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.2 International Shipping</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">International shipping availability depends on individual store policies:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Available to select countries only</li>
                    <li>• Delivery time: 7-21 business days</li>
                    <li>• Additional customs duties may apply</li>
                    <li>• Customer responsible for customs clearance</li>
                  </ul>
                </section>

                <section id="shipping-methods" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Shipping Methods</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Standard Delivery</h3>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Most economical option</li>
                        <li>• 3-7 business days</li>
                        <li>• Tracking provided</li>
                        <li>• Non-urgent orders</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Express Delivery</h3>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Faster shipping option</li>
                        <li>• 1-3 business days</li>
                        <li>• Priority handling</li>
                        <li>• Major cities only</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Same-Day Delivery</h3>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Select metro cities</li>
                        <li>• Orders before 2 PM</li>
                        <li>• Premium charges</li>
                        <li>• Subject to availability</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="order-processing" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Order Processing</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5.1 Processing Time</h3>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Standard processing: 1-2 business days</li>
                    <li>• Custom/made-to-order items: 3-7 business days</li>
                    <li>• Bulk orders: 3-5 business days</li>
                    <li>• Festival/sale periods: Extended processing time</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">5.2 Order Confirmation</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">After placing an order:</p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ol className="text-gray-700 space-y-2">
                      <li>1. Immediate order confirmation via SMS/email</li>
                      <li>2. Processing notification within 24 hours</li>
                      <li>3. Shipping confirmation with tracking details</li>
                      <li>4. Delivery updates via WhatsApp/SMS</li>
                    </ol>
                  </div>
                </section>

                <section id="order-tracking" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Order Tracking</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">7.1 Tracking Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Track your order using:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Order ID provided at purchase</li>
                    <li>• Tracking link sent via SMS/email</li>
                    <li>• Real-time status updates</li>
                    <li>• Expected delivery date information</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">7.2 Delivery Status</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-3">Order status updates include:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Order Confirmed</span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Processing</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Shipped</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Out for Delivery</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Delivered</span>
                    </div>
                  </div>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For shipping-related queries:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700">
                      <strong>Email:</strong> support@shopzap.io<br/>
                      <strong>Phone:</strong> +91 7798997439<br/>
                      <strong>WhatsApp:</strong> +91 7798997439<br/>
                      <strong>Business Hours:</strong> 9 AM to 8 PM, Monday to Saturday<br/>
                      <strong>Website:</strong> https://shopzap.io
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ShippingPolicy;
