
import React, { useEffect, useState } from 'react';
import { ArrowUp, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PricingPolicy = () => {
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
    { id: 'seller-pricing', title: 'Seller Pricing Control' },
    { id: 'platform-fees', title: 'Platform Fees' },
    { id: 'payment-processing', title: 'Payment Processing' },
    { id: 'price-variations', title: 'Price Variations' },
    { id: 'promotional-pricing', title: 'Promotional Pricing' },
    { id: 'currency-support', title: 'Currency Support' },
    { id: 'price-changes', title: 'Price Changes' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <title>Pricing Policy - ShopZap.io | Product Pricing Information</title>
      <meta name="description" content="Learn about ShopZap.io's pricing policy. Prices are set by sellers and may vary by region and availability. ShopZap doesn't control discounts." />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📄 Pricing Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding how pricing works on the ShopZap.io platform
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
                    This Pricing Policy explains how product pricing works on the ShopZap.io platform. As a marketplace platform, we enable sellers to set their own prices while providing transparent information to buyers about pricing practices.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                    <p className="text-yellow-800 font-medium">
                      Important: Prices may vary depending on seller, region, and availability. ShopZap doesn't control discounts or offer MRP guarantees.
                    </p>
                  </div>
                </section>

                <section id="seller-pricing" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Seller Pricing Control</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.1 Price Setting Authority</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All product prices on ShopZap.io are set and controlled by individual sellers. ShopZap does not:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Set or control product prices</li>
                    <li>• Guarantee specific price points</li>
                    <li>• Provide MRP (Maximum Retail Price) guarantees</li>
                    <li>• Control promotional discounts or offers</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.2 Seller Responsibilities</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Sellers are responsible for:</p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ul className="text-gray-700 space-y-2">
                      <li>• Setting competitive and fair prices</li>
                      <li>• Updating prices in real-time</li>
                      <li>• Honoring displayed prices at checkout</li>
                      <li>• Providing accurate product descriptions</li>
                      <li>• Clearly stating any additional charges</li>
                    </ul>
                  </div>
                </section>

                <section id="platform-fees" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Platform Fees</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">3.1 Subscription Fees</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">ShopZap charges sellers subscription fees for platform usage:</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-gray-900 mb-2">Free Plan</h4>
                      <p className="text-gray-700 text-sm">Basic features, limited products</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-2">Pro Plan</h4>
                      <p className="text-gray-700 text-sm">Advanced features, unlimited products</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-bold text-gray-900 mb-2">Enterprise</h4>
                      <p className="text-gray-700 text-sm">Custom solutions, priority support</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">3.2 Transaction Fees</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Payment processing fees are handled by our payment partners:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Credit/Debit cards: 2-3% per transaction</li>
                    <li>• UPI payments: 0-1% per transaction</li>
                    <li>• Net banking: 1-2% per transaction</li>
                    <li>• Digital wallets: 1-2% per transaction</li>
                  </ul>
                </section>

                <section id="price-variations" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Price Variations</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5.1 Factors Affecting Pricing</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Product prices may vary based on:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Geographic Factors</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Shipping costs to different regions</li>
                        <li>• Local taxes and duties</li>
                        <li>• Regional demand and supply</li>
                        <li>• Currency exchange rates</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Market Factors</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Product availability</li>
                        <li>• Seasonal demand</li>
                        <li>• Bulk order quantities</li>
                        <li>• Seller competition</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="promotional-pricing" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Promotional Pricing</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">6.1 Seller-Controlled Discounts</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Sellers may offer various promotional pricing:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Seasonal sales and discounts</li>
                    <li>• Bulk order pricing</li>
                    <li>• First-time buyer discounts</li>
                    <li>• Loyalty program benefits</li>
                    <li>• Flash sales and limited-time offers</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">6.2 Platform Promotions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ShopZap may occasionally run platform-wide promotional campaigns in partnership with sellers, but all pricing decisions remain with individual sellers.
                  </p>
                </section>

                <section id="price-changes" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Price Changes</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">8.1 Real-Time Updates</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Sellers can update their prices in real-time through the ShopZap dashboard. Price changes take effect immediately on the platform.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">8.2 Price Protection</h3>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <p className="text-green-800 font-medium">
                      Once you add items to your cart, the price is locked for 30 minutes to complete your purchase.
                    </p>
                  </div>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For pricing-related questions or concerns:
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

export default PricingPolicy;
