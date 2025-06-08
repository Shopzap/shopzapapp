
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
          <p className="text-muted-foreground text-center mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              ShopZap.io ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Business information (store name, description, address)</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Account credentials and preferences</li>
            </ul>

            <h3>2.2 Usage Data</h3>
            <p>We automatically collect certain information when you use our service:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage patterns and interactions with our platform</li>
              <li>Store performance and analytics data</li>
              <li>Customer interaction data through WhatsApp integration</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process payments and transactions</li>
              <li>Send important updates and notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            
            <h3>4.1 Service Providers</h3>
            <ul>
              <li>Payment processors (Razorpay) for transaction processing</li>
              <li>Cloud hosting providers for data storage</li>
              <li>Analytics providers for platform improvement</li>
              <li>Customer support tools</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law or to:</p>
            <ul>
              <li>Comply with legal processes</li>
              <li>Protect our rights and property</li>
              <li>Prevent fraud or illegal activities</li>
              <li>Ensure user safety</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure payment processing through certified providers</li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Data portability</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>

            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
            </p>

            <h2>10. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: [PRIVACY_EMAIL]<br/>
              Address: [COMPANY_ADDRESS]
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
