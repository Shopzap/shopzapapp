
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PricingPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Pricing Policy</h1>
          <p className="text-muted-foreground text-center mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Overview</h2>
            <p>
              This Pricing Policy outlines the fee structure, billing terms, and pricing practices for ShopZap.io platform services. Our transparent pricing ensures you understand all costs associated with using our e-commerce platform.
            </p>

            <h2>2. Platform Subscription Plans</h2>
            
            <h3>2.1 Free Plan</h3>
            <ul>
              <li>Cost: ₹0/month</li>
              <li>Up to 10 products</li>
              <li>Basic store customization</li>
              <li>WhatsApp integration</li>
              <li>Standard support</li>
              <li>ShopZap branding included</li>
            </ul>

            <h3>2.2 Starter Plan</h3>
            <ul>
              <li>Cost: ₹299/month or ₹2,999/year (save 17%)</li>
              <li>Up to 100 products</li>
              <li>Advanced customization</li>
              <li>Remove ShopZap branding</li>
              <li>Priority support</li>
              <li>Basic analytics</li>
            </ul>

            <h3>2.3 Growth Plan</h3>
            <ul>
              <li>Cost: ₹599/month or ₹5,999/year (save 17%)</li>
              <li>Up to 500 products</li>
              <li>Custom domain support</li>
              <li>Advanced analytics</li>
              <li>Multiple payment gateways</li>
              <li>Bulk upload features</li>
            </ul>

            <h3>2.4 Enterprise Plan</h3>
            <ul>
              <li>Cost: ₹1,299/month or ₹12,999/year (save 17%)</li>
              <li>Unlimited products</li>
              <li>White-label solution</li>
              <li>Dedicated account manager</li>
              <li>Custom integrations</li>
              <li>24/7 priority support</li>
            </ul>

            <h2>3. Transaction Fees</h2>
            
            <h3>3.1 Payment Processing Fees</h3>
            <p>
              Payment processing fees are charged per successful transaction:
            </p>
            <ul>
              <li>UPI/Digital Wallets: 0.9% + ₹1 per transaction</li>
              <li>Credit/Debit Cards: 1.9% + ₹3 per transaction</li>
              <li>Net Banking: 1.2% + ₹2 per transaction</li>
              <li>International Cards: 3.5% + ₹5 per transaction</li>
            </ul>

            <h3>3.2 Platform Commission</h3>
            <ul>
              <li>Free Plan: 2% per transaction</li>
              <li>Starter Plan: 1.5% per transaction</li>
              <li>Growth Plan: 1% per transaction</li>
              <li>Enterprise Plan: 0.5% per transaction</li>
            </ul>

            <h2>4. Additional Services</h2>
            
            <h3>4.1 Premium Features</h3>
            <ul>
              <li>Custom Theme Development: ₹5,000 - ₹25,000</li>
              <li>Advanced SEO Setup: ₹2,500</li>
              <li>Professional Product Photography: ₹500 per product</li>
              <li>Store Migration Service: ₹1,500</li>
              <li>Training & Onboarding: ₹3,000</li>
            </ul>

            <h3>4.2 Marketing Services</h3>
            <ul>
              <li>Google Ads Management: 15% of ad spend + ₹3,000/month</li>
              <li>Social Media Marketing: ₹5,000 - ₹15,000/month</li>
              <li>WhatsApp Business API: ₹2,000/month</li>
              <li>Email Marketing: ₹1,000/month (up to 5,000 contacts)</li>
            </ul>

            <h2>5. Billing and Payment Terms</h2>
            
            <h3>5.1 Billing Cycle</h3>
            <ul>
              <li>Monthly plans: Billed every 30 days</li>
              <li>Annual plans: Billed yearly with discount</li>
              <li>Payment due immediately upon billing</li>
              <li>Auto-renewal unless cancelled</li>
            </ul>

            <h3>5.2 Accepted Payment Methods</h3>
            <ul>
              <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
              <li>UPI (GPay, PhonePe, Paytm)</li>
              <li>Net Banking</li>
              <li>Digital Wallets</li>
            </ul>

            <h3>5.3 Late Payment Policy</h3>
            <ul>
              <li>Grace period: 7 days after due date</li>
              <li>Service suspension after 10 days</li>
              <li>Account termination after 30 days</li>
              <li>Late fee: ₹500 for delayed payments</li>
            </ul>

            <h2>6. Price Changes</h2>
            
            <h3>6.1 Subscription Price Changes</h3>
            <ul>
              <li>30 days advance notice for price increases</li>
              <li>Existing customers grandfathered for 6 months</li>
              <li>Option to cancel before new pricing takes effect</li>
              <li>Price reductions effective immediately</li>
            </ul>

            <h3>6.2 Transaction Fee Changes</h3>
            <ul>
              <li>Subject to payment gateway partner changes</li>
              <li>15 days notice for fee structure updates</li>
              <li>Transparent communication of all changes</li>
            </ul>

            <h2>7. Discounts and Promotions</h2>
            
            <h3>7.1 Available Discounts</h3>
            <ul>
              <li>Annual payment discount: 17% off monthly rate</li>
              <li>Student discount: 50% off for verified students</li>
              <li>Startup discount: 30% off first year for startups</li>
              <li>Volume discount: Custom pricing for enterprise</li>
            </ul>

            <h3>7.2 Promotional Offers</h3>
            <ul>
              <li>Free trial periods for new users</li>
              <li>Seasonal promotional campaigns</li>
              <li>Referral bonuses and credits</li>
              <li>Loyalty rewards for long-term customers</li>
            </ul>

            <h2>8. Refund and Cancellation</h2>
            <p>
              Please refer to our detailed <Link to="/refund" className="text-primary hover:underline">Refund & Cancellation Policy</Link> for information about refunds, cancellations, and related terms.
            </p>

            <h2>9. Tax Information</h2>
            
            <h3>9.1 Indian Tax (GST)</h3>
            <ul>
              <li>All prices inclusive of 18% GST</li>
              <li>GST invoice provided for all transactions</li>
              <li>GSTIN: [COMPANY_GSTIN]</li>
              <li>Tax calculation based on registered address</li>
            </ul>

            <h3>9.2 International Taxes</h3>
            <ul>
              <li>Local taxes may apply based on jurisdiction</li>
              <li>Customer responsible for compliance</li>
              <li>VAT/Sales tax as per local regulations</li>
            </ul>

            <h2>10. Pricing Transparency</h2>
            
            <h3>10.1 No Hidden Fees</h3>
            <ul>
              <li>All fees clearly disclosed upfront</li>
              <li>No setup or activation charges</li>
              <li>No contract cancellation penalties</li>
              <li>Transparent pricing calculator available</li>
            </ul>

            <h3>10.2 Cost Breakdown</h3>
            <p>
              Detailed cost breakdown available in your dashboard:
            </p>
            <ul>
              <li>Subscription fees</li>
              <li>Transaction charges</li>
              <li>Additional service costs</li>
              <li>Tax implications</li>
            </ul>

            <h2>11. Contact Information</h2>
            <p>
              For pricing-related questions or custom quotes:
            </p>
            <p>
              Email: [SALES_EMAIL]<br/>
              Phone: [SALES_PHONE]<br/>
              Business Hours: Monday to Friday, 9 AM to 6 PM IST<br/>
              Address: [COMPANY_ADDRESS]
            </p>

            <h2>12. Policy Updates</h2>
            <p>
              This pricing policy may be updated to reflect service improvements, market changes, or regulatory requirements. Significant changes will be communicated 30 days in advance.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPolicy;
