
import React, { useEffect, useState } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
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
    { id: 'platform-refunds', title: 'Platform Service Refunds' },
    { id: 'store-refunds', title: 'Store Transaction Refunds' },
    { id: 'cancellation', title: 'Cancellation Policy' },
    { id: 'refund-process', title: 'Refund Process' },
    { id: 'special-circumstances', title: 'Special Circumstances' },
    { id: 'dispute-resolution', title: 'Dispute Resolution' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <title>Refund & Cancellation Policy - ShopZap.io | Returns & Refunds</title>
      <meta name="description" content="Learn about ShopZap.io's refund and cancellation policy. Refunds are processed by sellers - ShopZap provides the checkout platform." />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RotateCcw className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📄 Refund & Cancellation Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding our refund and cancellation terms for both platform services and store transactions
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
                    At ShopZap.io, we strive to provide excellent service to all our users. This Refund & Cancellation Policy outlines the terms and conditions for refunds and cancellations for both our platform services and transactions made through stores on our platform.
                  </p>
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mt-6">
                    <p className="text-orange-800 font-medium">
                      Important: Refunds are processed by the seller. ShopZap only provides a checkout platform.
                    </p>
                  </div>
                </section>

                <section id="platform-refunds" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Platform Service Refunds</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.1 Subscription Refunds</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">For ShopZap.io subscription services:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Monthly subscriptions: Refunds available within 7 days of purchase</li>
                    <li>• Annual subscriptions: Refunds available within 30 days of purchase</li>
                    <li>• Refunds are prorated based on unused service time</li>
                    <li>• Refund requests must be submitted through our support system</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.2 Non-Refundable Services</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">The following services are non-refundable:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Transaction fees and payment processing charges</li>
                    <li>• Custom development or setup services</li>
                    <li>• Services used beyond the refund period</li>
                    <li>• Premium features that have been actively utilized</li>
                  </ul>
                </section>

                <section id="store-refunds" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Store Transaction Refunds</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">3.1 Customer Purchases</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For purchases made through stores on our platform, refund policies are determined by individual store owners. However, we recommend the following standard policy:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Products can be returned within 7-14 days of delivery</li>
                    <li>• Items must be unused and in original packaging</li>
                    <li>• Customer is responsible for return shipping costs</li>
                    <li>• Refunds processed within 5-7 business days</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">3.2 Defective or Damaged Products</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">For defective or damaged products:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Report issues within 48 hours of delivery</li>
                    <li>• Provide photographic evidence of damage</li>
                    <li>• Full refund or replacement at customer's choice</li>
                    <li>• Return shipping costs covered by seller</li>
                  </ul>
                </section>

                {/* Continue with remaining sections... */}
                <section id="refund-process" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Refund Process</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5.1 How to Request a Refund</h3>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <ol className="text-gray-700 leading-relaxed space-y-2">
                      <li>1. Contact our support team at support@shopzap.io</li>
                      <li>2. Provide order/subscription details</li>
                      <li>3. Specify reason for refund request</li>
                      <li>4. Submit any required documentation</li>
                      <li>5. Await confirmation and processing</li>
                    </ol>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">5.2 Processing Time</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Refund processing times:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Platform services: 5-7 business days</li>
                    <li>• Credit card refunds: 5-10 business days</li>
                    <li>• UPI/Digital wallet refunds: 1-3 business days</li>
                    <li>• Bank transfer refunds: 3-7 business days</li>
                  </ul>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For refund and cancellation requests:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700">
                      <strong>Email:</strong> support@shopzap.io<br/>
                      <strong>Phone:</strong> +91 7798997439<br/>
                      <strong>Business Hours:</strong> Monday to Friday, 9 AM to 6 PM IST<br/>
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

export default RefundPolicy;
