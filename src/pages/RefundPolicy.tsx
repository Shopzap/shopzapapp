
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground text-center mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Overview</h2>
            <p>
              At ShopZap.io, we strive to provide excellent service to all our users. This Refund & Cancellation Policy outlines the terms and conditions for refunds and cancellations for both our platform services and transactions made through stores on our platform.
            </p>

            <h2>2. Platform Service Refunds</h2>
            
            <h3>2.1 Subscription Refunds</h3>
            <p>
              For ShopZap.io subscription services:
            </p>
            <ul>
              <li>Monthly subscriptions: Refunds available within 7 days of purchase</li>
              <li>Annual subscriptions: Refunds available within 30 days of purchase</li>
              <li>Refunds are prorated based on unused service time</li>
              <li>Refund requests must be submitted through our support system</li>
            </ul>

            <h3>2.2 Non-Refundable Services</h3>
            <p>The following services are non-refundable:</p>
            <ul>
              <li>Transaction fees and payment processing charges</li>
              <li>Custom development or setup services</li>
              <li>Services used beyond the refund period</li>
              <li>Premium features that have been actively utilized</li>
            </ul>

            <h2>3. Store Transaction Refunds</h2>
            
            <h3>3.1 Customer Purchases</h3>
            <p>
              For purchases made through stores on our platform, refund policies are determined by individual store owners. However, we recommend the following standard policy:
            </p>
            <ul>
              <li>Products can be returned within 7-14 days of delivery</li>
              <li>Items must be unused and in original packaging</li>
              <li>Customer is responsible for return shipping costs</li>
              <li>Refunds processed within 5-7 business days</li>
            </ul>

            <h3>3.2 Defective or Damaged Products</h3>
            <p>
              For defective or damaged products:
            </p>
            <ul>
              <li>Report issues within 48 hours of delivery</li>
              <li>Provide photographic evidence of damage</li>
              <li>Full refund or replacement at customer's choice</li>
              <li>Return shipping costs covered by seller</li>
            </ul>

            <h2>4. Cancellation Policy</h2>
            
            <h3>4.1 Subscription Cancellation</h3>
            <p>
              You can cancel your ShopZap.io subscription at any time:
            </p>
            <ul>
              <li>Access your account settings to cancel</li>
              <li>Cancellation takes effect at the end of current billing period</li>
              <li>No additional charges after cancellation</li>
              <li>Data export available for 30 days post-cancellation</li>
            </ul>

            <h3>4.2 Order Cancellation</h3>
            <p>
              For order cancellations:
            </p>
            <ul>
              <li>Orders can be cancelled before shipping/processing</li>
              <li>Contact the store directly for cancellation requests</li>
              <li>Full refund for successfully cancelled orders</li>
              <li>Refund processing time: 3-5 business days</li>
            </ul>

            <h2>5. Refund Process</h2>
            
            <h3>5.1 How to Request a Refund</h3>
            <ol>
              <li>Contact our support team at {{supportEmail}}</li>
              <li>Provide order/subscription details</li>
              <li>Specify reason for refund request</li>
              <li>Submit any required documentation</li>
              <li>Await confirmation and processing</li>
            </ol>

            <h3>5.2 Processing Time</h3>
            <p>
              Refund processing times:
            </p>
            <ul>
              <li>Platform services: 5-7 business days</li>
              <li>Credit card refunds: 5-10 business days</li>
              <li>UPI/Digital wallet refunds: 1-3 business days</li>
              <li>Bank transfer refunds: 3-7 business days</li>
            </ul>

            <h2>6. Special Circumstances</h2>
            
            <h3>6.1 Technical Issues</h3>
            <p>
              If you experience technical issues preventing service use:
            </p>
            <ul>
              <li>Report issues immediately to support</li>
              <li>We'll attempt to resolve within 24-48 hours</li>
              <li>Prorated refunds for extended downtime</li>
              <li>Service credits as alternative to refunds</li>
            </ul>

            <h3>6.2 Policy Violations</h3>
            <p>
              Accounts terminated for policy violations are not eligible for refunds.
            </p>

            <h2>7. Dispute Resolution</h2>
            <p>
              For refund disputes:
            </p>
            <ul>
              <li>Contact our support team first</li>
              <li>Escalate to management if unresolved</li>
              <li>Mediation through consumer forums if needed</li>
              <li>Legal jurisdiction: {{jurisdiction}}</li>
            </ul>

            <h2>8. Contact Information</h2>
            <p>
              For refund and cancellation requests:
            </p>
            <p>
              Email: {{supportEmail}}<br/>
              Phone: {{supportPhone}}<br/>
              Business Hours: Monday to Friday, 9 AM to 6 PM IST<br/>
              Address: {{companyAddress}}
            </p>

            <h2>9. Policy Updates</h2>
            <p>
              This policy may be updated periodically. Users will be notified of significant changes via email or platform notifications.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
