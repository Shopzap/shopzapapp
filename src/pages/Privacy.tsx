
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
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
    { id: 'information-collection', title: 'Information We Collect' },
    { id: 'information-use', title: 'How We Use Information' },
    { id: 'information-sharing', title: 'Information Sharing' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies and Tracking' },
    { id: 'third-party', title: 'Third-Party Links' },
    { id: 'children', title: 'Children\'s Privacy' },
    { id: 'international', title: 'International Transfers' },
    { id: 'changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <title>Privacy Policy - ShopZap.io | Data Protection & User Privacy</title>
      <meta name="description" content="Learn how ShopZap.io protects your privacy and handles your personal data. We do not sell your data - it's only used for order processing and support." />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📄 Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
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
                  <p className="text-gray-700 leading-relaxed">
                    ShopZap.io ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
                    <p className="text-green-800 font-medium">
                      We do not sell your data. Data is only used for order processing and customer support.
                    </p>
                  </div>
                </section>

                <section id="information-collection" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.1 Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">We may collect the following personal information:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• <strong>Name and contact information</strong> (email, phone number)</li>
                    <li>• <strong>Shipping address</strong> for order delivery</li>
                    <li>• <strong>Business information</strong> (store name, description)</li>
                    <li>• <strong>Payment information</strong> (processed securely through Razorpay)</li>
                    <li>• <strong>Account credentials</strong> and preferences</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">2.2 Usage Data</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">We automatically collect certain information:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Device information (IP address, browser type, operating system)</li>
                    <li>• Usage patterns and interactions with our platform</li>
                    <li>• Store performance and analytics data</li>
                    <li>• Customer interaction data through WhatsApp integration</li>
                  </ul>
                </section>

                <section id="information-use" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">We use your information to:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Provide and maintain our services</li>
                    <li>• Process payments and transactions</li>
                    <li>• Send important updates and notifications</li>
                    <li>• Improve our platform and user experience</li>
                    <li>• Provide customer support</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Prevent fraud and ensure platform security</li>
                  </ul>
                </section>

                <section id="information-sharing" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Information Sharing and Disclosure</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">4.1 Service Providers</h3>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6 mb-6">
                    <li>• Payment processors (Razorpay) for transaction processing</li>
                    <li>• Email service providers (MailerSend, Resend) for notifications</li>
                    <li>• Cloud hosting providers for data storage</li>
                    <li>• Analytics providers for platform improvement</li>
                    <li>• Customer support tools</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">4.2 Legal Requirements</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">We may disclose your information if required by law or to:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Comply with legal processes</li>
                    <li>• Protect our rights and property</li>
                    <li>• Prevent fraud or illegal activities</li>
                    <li>• Ensure user safety</li>
                  </ul>
                </section>

                {/* Continue with remaining sections... */}
                <section id="data-security" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Security</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement appropriate security measures to protect your personal information:
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Encryption of sensitive data in transit and at rest</li>
                    <li>• Regular security assessments and updates</li>
                    <li>• Access controls and authentication measures</li>
                    <li>• Secure payment processing through certified providers</li>
                  </ul>
                </section>

                <section id="your-rights" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Your Rights</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
                  <ul className="text-gray-700 leading-relaxed space-y-2 ml-6">
                    <li>• Access your personal information</li>
                    <li>• Correct inaccurate or incomplete data</li>
                    <li>• Request deletion of your personal information</li>
                    <li>• Object to processing of your personal information</li>
                    <li>• Data portability</li>
                    <li>• Withdraw consent (where applicable)</li>
                  </ul>
                </section>

                <section id="cookies" className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Cookies and Tracking</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
                  </p>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Contact Us</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
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

export default Privacy;
