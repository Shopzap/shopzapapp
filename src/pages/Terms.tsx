
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-jakarta mb-8 text-center">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using ShopZap's services, you accept and agree to be bound by the 
                  terms and provision of this agreement. These Terms of Service govern your use of 
                  our platform and services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  ShopZap provides an online platform that enables users to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Create and manage online stores</li>
                  <li>Automate Instagram DM responses</li>
                  <li>Process payments through integrated gateways</li>
                  <li>Manage products and inventory</li>
                  <li>Access analytics and reporting tools</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">3. User Responsibilities</h2>
                <p className="text-muted-foreground mb-4">
                  As a user of our service, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the service for illegal or unauthorized purposes</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">4. Payment Terms</h2>
                <p className="text-muted-foreground mb-4">
                  For paid services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Fees are charged in Indian Rupees (INR)</li>
                  <li>Payments are processed through Razorpay</li>
                  <li>Subscriptions renew automatically unless cancelled</li>
                  <li>Refunds are subject to our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The ShopZap platform, including its design, functionality, and content, is owned by 
                  ShopZap and protected by intellectual property laws. You retain ownership of content 
                  you upload to the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  ShopZap shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including without limitation, loss of profits, data, use, 
                  goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">7. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the service at our sole 
                  discretion, without prior notice, for conduct that we believe violates these Terms 
                  or is harmful to other users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">8. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of 
                  significant changes via email or through the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-jakarta mb-4">9. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-muted-foreground mt-4">
                  Email: legal@shopzap.io<br />
                  Address: Mumbai, Maharashtra, India
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default Terms;
