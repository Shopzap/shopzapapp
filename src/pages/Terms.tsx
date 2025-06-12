
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
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
    { id: 'introduction', title: 'Introduction' },
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'service-description', title: 'Service Description' },
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'prohibited-uses', title: 'Prohibited Uses' },
    { id: 'payment-terms', title: 'Payment Terms' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'user-content', title: 'User-Generated Content' },
    { id: 'termination', title: 'Termination' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <title>Terms & Conditions - ShopZap.io | E-commerce Platform Terms of Service</title>
      <meta name="description" content="Read ShopZap.io's Terms & Conditions. Understand the rules and guidelines for using our WhatsApp e-commerce platform as a seller or buyer." />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📄 Terms & Conditions
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using ShopZap.io
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
                <section id="introduction" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Welcome to ShopZap.io ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website and services provided through the ShopZap platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
                  </p>
                </section>

                <section id="acceptance" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Acceptance of Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                </section>

                <section id="service-description" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Description of Service</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ShopZap.io is an e-commerce platform that enables users to create online stores and sell products through WhatsApp integration. Our services include:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Store creation and customization tools</li>
                    <li>• Product catalog management</li>
                    <li>• Order processing and payment integration</li>
                    <li>• WhatsApp integration for customer communication</li>
                    <li>• Analytics and reporting tools</li>
                  </ul>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                    <p className="text-blue-800 font-medium">
                      Important: ShopZap is a marketplace platform. We are not responsible for the quality of seller products.
                    </p>
                  </div>
                </section>

                <section id="user-accounts" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. User Accounts</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To use certain features of our service, you must create an account. You are responsible for:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Maintaining the confidentiality of your account credentials</li>
                    <li>• All activities that occur under your account</li>
                    <li>• Providing accurate and complete information</li>
                    <li>• Keeping your account information updated</li>
                  </ul>
                </section>

                <section id="prohibited-uses" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Prohibited Uses</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">You may not use our service:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>• To sell counterfeit, illegal, or prohibited products</li>
                    <li>• To transmit or procure the sending of advertising or promotional material without prior written consent</li>
                    <li>• To impersonate or attempt to impersonate the company, employees, or other users</li>
                  </ul>
                </section>

                <section id="payment-terms" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Payment Terms</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Payment processing is handled through Razorpay and other authorized payment partners. By using our payment services, you agree to:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Provide accurate payment information</li>
                    <li>• Pay all fees associated with your use of the service</li>
                    <li>• Accept responsibility for all charges incurred under your account</li>
                  </ul>
                </section>

                <section id="intellectual-property" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property Rights</h2>
                  <p className="text-gray-700 leading-relaxed">
                    The service and its original content, features, and functionality are and will remain the exclusive property of ShopZap.io and its licensors. The service is protected by copyright, trademark, and other laws.
                  </p>
                </section>

                <section id="user-content" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. User-Generated Content</h2>
                  <p className="text-gray-700 leading-relaxed">
                    You retain ownership of content you upload to our platform. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, and display such content in connection with our services.
                  </p>
                </section>

                <section id="termination" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.
                  </p>
                </section>

                <section id="liability" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Limitation of Liability</h2>
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall ShopZap.io, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of your use of the service.
                  </p>
                </section>

                <section id="governing-law" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Governing Law</h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section id="changes" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Changes to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700">
                      <strong>Email:</strong> support@shopzap.io<br/>
                      <strong>Website:</strong> https://shopzap.io<br/>
                      <strong>Support Hours:</strong> Monday to Friday, 9 AM to 6 PM IST
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

export default Terms;
