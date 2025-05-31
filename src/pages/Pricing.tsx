import React from 'react';

const Pricing = () => {
  return (
    <>
      <h1 className="text-3xl font-bold">Pricing Plans</h1>
      <p className="mt-2 text-gray-600">Choose the plan that fits your business needs.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Free Plan */}
        <div className="p-6 border rounded-lg shadow">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-gray-500">₹0 / month</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✅ Add up to 10 products</li>
            <li>✅ Basic store customization</li>
            <li>❌ No analytics</li>
            <li>❌ No priority support</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="p-6 border rounded-lg shadow border-purple-500 bg-purple-50">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-purple-700 font-bold">₹499 / month</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✅ Unlimited products</li>
            <li>✅ Advanced store customization</li>
            <li>✅ Access to analytics</li>
            <li>✅ Priority support</li>
          </ul>
        </div>

        {/* Enterprise Plan */}
        <div className="p-6 border rounded-lg shadow">
          <h2 className="text-xl font-semibold">Enterprise</h2>
          <p className="mt-2 text-gray-500">Custom Pricing</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✅ Everything in Pro</li>
            <li>✅ Team access & permissions</li>
            <li>✅ Dedicated account manager</li>
            <li>✅ API Access</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Pricing;
