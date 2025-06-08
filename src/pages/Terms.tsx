
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms and Conditions</h1>
          <p className="text-muted-foreground text-center mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to ShopZap.io ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website located at {{websiteUrl}} and our services provided through the ShopZap platform.
            </p>
            <p>
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
            </p>

            <h2>2. Acceptance of Terms</h2>
            <p>
              By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>

            <h2>3. Description of Service</h2>
            <p>
              ShopZap.io is an e-commerce platform that enables users to create online stores and sell products through WhatsApp integration. Our services include:
            </p>
            <ul>
              <li>Store creation and customization tools</li>
              <li>Product catalog management</li>
              <li>Order processing and payment integration</li>
              <li>WhatsApp integration for customer communication</li>
              <li>Analytics and reporting tools</li>
            </ul>

            <h2>4. User Accounts</h2>
            <p>
              To use certain features of our service, you must create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Keeping your account information updated</li>
            </ul>

            <h2>5. Prohibited Uses</h2>
            <p>You may not use our service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To sell counterfeit, illegal, or prohibited products</li>
              <li>To transmit or procure the sending of advertising or promotional material without prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, employees, or other users</li>
            </ul>

            <h2>6. Payment Terms</h2>
            <p>
              Payment processing is handled through Razorpay and other authorized payment partners. By using our payment services, you agree to:
            </p>
            <ul>
              <li>Provide accurate payment information</li>
              <li>Pay all fees associated with your use of the service</li>
              <li>Accept responsibility for all charges incurred under your account</li>
            </ul>

            <h2>7. Intellectual Property Rights</h2>
            <p>
              The service and its original content, features, and functionality are and will remain the exclusive property of ShopZap.io and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>

            <h2>8. User-Generated Content</h2>
            <p>
              You retain ownership of content you upload to our platform. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, and display such content in connection with our services.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              In no event shall ShopZap.io, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of your use of the service.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page and updating the "Last updated" date.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: {{supportEmail}}<br/>
              Address: {{companyAddress}}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
