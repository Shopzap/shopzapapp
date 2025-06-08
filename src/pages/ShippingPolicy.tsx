
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Shipping & Delivery Policy</h1>
          <p className="text-muted-foreground text-center mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Overview</h2>
            <p>
              This Shipping & Delivery Policy applies to all orders placed through stores on the ShopZap.io platform. Individual store owners are responsible for fulfilling orders according to their specific shipping policies, which should align with these general guidelines.
            </p>

            <h2>2. Shipping Coverage</h2>
            
            <h3>2.1 Domestic Shipping</h3>
            <p>
              We facilitate shipping across India through our partner stores:
            </p>
            <ul>
              <li>Major cities: 2-4 business days</li>
              <li>Tier 2 cities: 3-6 business days</li>
              <li>Remote areas: 5-10 business days</li>
              <li>Kashmir, Northeast: 7-14 business days</li>
            </ul>

            <h3>2.2 International Shipping</h3>
            <p>
              International shipping availability depends on individual store policies:
            </p>
            <ul>
              <li>Available to select countries only</li>
              <li>Delivery time: 7-21 business days</li>
              <li>Additional customs duties may apply</li>
              <li>Customer responsible for customs clearance</li>
            </ul>

            <h2>3. Shipping Methods</h2>
            
            <h3>3.1 Standard Delivery</h3>
            <ul>
              <li>Most economical shipping option</li>
              <li>Delivery within 3-7 business days</li>
              <li>Tracking information provided</li>
              <li>Suitable for non-urgent orders</li>
            </ul>

            <h3>3.2 Express Delivery</h3>
            <ul>
              <li>Faster shipping option (additional charges apply)</li>
              <li>Delivery within 1-3 business days</li>
              <li>Priority handling and tracking</li>
              <li>Available in major cities only</li>
            </ul>

            <h3>3.3 Same-Day Delivery</h3>
            <ul>
              <li>Available in select metro cities</li>
              <li>Orders placed before 2 PM</li>
              <li>Premium charges apply</li>
              <li>Subject to product and location availability</li>
            </ul>

            <h2>4. Shipping Charges</h2>
            
            <h3>4.1 Standard Charges</h3>
            <p>
              Shipping charges are determined by:
            </p>
            <ul>
              <li>Product weight and dimensions</li>
              <li>Delivery distance and location</li>
              <li>Chosen shipping method</li>
              <li>Store-specific shipping policies</li>
            </ul>

            <h3>4.2 Free Shipping</h3>
            <p>
              Many stores offer free shipping:
            </p>
            <ul>
              <li>On orders above minimum value (typically ₹500-₹1000)</li>
              <li>For premium customers or loyalty members</li>
              <li>During promotional campaigns</li>
              <li>On specific product categories</li>
            </ul>

            <h2>5. Order Processing</h2>
            
            <h3>5.1 Processing Time</h3>
            <ul>
              <li>Standard processing: 1-2 business days</li>
              <li>Custom/made-to-order items: 3-7 business days</li>
              <li>Bulk orders: 3-5 business days</li>
              <li>Festival/sale periods: Extended processing time</li>
            </ul>

            <h3>5.2 Order Confirmation</h3>
            <p>
              After placing an order:
            </p>
            <ul>
              <li>Immediate order confirmation via SMS/email</li>
              <li>Processing notification within 24 hours</li>
              <li>Shipping confirmation with tracking details</li>
              <li>Delivery updates via WhatsApp/SMS</li>
            </ul>

            <h2>6. Delivery Process</h2>
            
            <h3>6.1 Address Requirements</h3>
            <p>
              Ensure accurate delivery information:
            </p>
            <ul>
              <li>Complete address with landmark</li>
              <li>Active phone number for contact</li>
              <li>Alternative contact if needed</li>
              <li>Clear delivery instructions</li>
            </ul>

            <h3>6.2 Delivery Attempts</h3>
            <ul>
              <li>Up to 3 delivery attempts</li>
              <li>Customer notified before each attempt</li>
              <li>Alternative delivery arrangements possible</li>
              <li>Package returned to seller after failed attempts</li>
            </ul>

            <h2>7. Order Tracking</h2>
            
            <h3>7.1 Tracking Information</h3>
            <p>
              Track your order using:
            </p>
            <ul>
              <li>Order ID provided at purchase</li>
              <li>Tracking link sent via SMS/email</li>
              <li>Real-time status updates</li>
              <li>Expected delivery date information</li>
            </ul>

            <h3>7.2 Delivery Status</h3>
            <p>
              Order status updates include:
            </p>
            <ul>
              <li>Order confirmed</li>
              <li>Processing/packaging</li>
              <li>Shipped/in transit</li>
              <li>Out for delivery</li>
              <li>Delivered</li>
            </ul>

            <h2>8. Special Delivery Instructions</h2>
            
            <h3>8.1 Fragile Items</h3>
            <ul>
              <li>Extra protective packaging</li>
              <li>Careful handling throughout transit</li>
              <li>Signature required on delivery</li>
              <li>Insurance coverage available</li>
            </ul>

            <h3>8.2 Valuable Items</h3>
            <ul>
              <li>Secure packaging and sealing</li>
              <li>Verification required at delivery</li>
              <li>Photo/video proof of delivery</li>
              <li>Enhanced tracking and monitoring</li>
            </ul>

            <h2>9. Delivery Issues</h2>
            
            <h3>9.1 Delayed Delivery</h3>
            <p>
              In case of delays:
            </p>
            <ul>
              <li>Proactive communication to customers</li>
              <li>Updated delivery timeline provided</li>
              <li>Compensation/discount for significant delays</li>
              <li>Option to cancel order if preferred</li>
            </ul>

            <h3>9.2 Damaged/Lost Packages</h3>
            <ul>
              <li>Report issues within 24 hours of delivery</li>
              <li>Provide photographic evidence</li>
              <li>Investigation initiated immediately</li>
              <li>Replacement/refund as appropriate</li>
            </ul>

            <h2>10. Returns & Exchanges</h2>
            <p>
              For returns and exchanges, please refer to our <Link to="/refund" className="text-primary hover:underline">Refund & Cancellation Policy</Link>.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              For shipping-related queries:
            </p>
            <p>
              Email: [SHIPPING_EMAIL]<br/>
              Phone: [SUPPORT_PHONE]<br/>
              WhatsApp: [WHATSAPP_NUMBER]<br/>
              Business Hours: 9 AM to 8 PM, Monday to Saturday<br/>
              Address: [COMPANY_ADDRESS]
            </p>

            <h2>12. Policy Updates</h2>
            <p>
              This shipping policy may be updated to reflect changes in logistics partnerships, service improvements, or regulatory requirements. Updates will be communicated through the platform.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
