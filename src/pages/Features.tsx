import React from 'react';

const Features = () => {
  return (
    <>
      <h1 className="text-3xl font-bold">Key Features of ShopZap.io</h1>
      <p className="mt-2 text-gray-600">Everything you need to run a successful reselling business.</p>

      <ul className="mt-6 space-y-4 text-gray-700">
        <li>
          <strong>🛍️ Product Management:</strong> Add, edit, or delete your product listings easily.
        </li>
        <li>
          <strong>📦 Order Tracking:</strong> Keep track of every order from confirmation to delivery.
        </li>
        <li>
          <strong>🎨 Store Customization:</strong> Change your store name, banner, and look & feel.
        </li>
        <li>
          <strong>📊 Analytics:</strong> Get insights into your sales, product performance, and revenue trends.
        </li>
        <li>
          <strong>🛠️ Settings:</strong> Update your profile, preferences, and security options.
        </li>
      </ul>
    </>
  );
};

export default Features;
