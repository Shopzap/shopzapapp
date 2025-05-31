import React from 'react';

const Settings = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar for navigation (if needed, otherwise full width) */}


      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Store Settings</h1>

        {/* Store Information Section */}
        <section id="store-info" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Store Information</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">Store Name</label>
              <input type="text" id="store-name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="My Awesome Store" />
            </div>
            <div>
              <label htmlFor="store-description" className="block text-sm font-medium text-gray-700">Store Description</label>
              <textarea id="store-description" rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="A brief description of your store..."></textarea>
            </div>
            <div>
              <label htmlFor="upload-logo" className="block text-sm font-medium text-gray-700">Upload Logo</label>
              <input type="file" id="upload-logo" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {/* Logo preview placeholder */}
              <div className="mt-2 w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center text-gray-400">Logo Preview</div>
            </div>
            <div>
              <label htmlFor="upload-banner" className="block text-sm font-medium text-gray-700">Upload Banner Image</label>
              <input type="file" id="upload-banner" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
          </form>
        </section>

        {/* Account Settings Section */}
        <section id="account-settings" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Account Settings</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" defaultValue="current_username" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" defaultValue="user@example.com" readOnly />
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Change Password</button>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
          </form>
        </section>

        {/* Branding & Domain Section */}
        <section id="branding-domain" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Branding & Domain</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input type="text" id="subdomain" className="flex-1 block w-full rounded-none rounded-l-md border border-gray-300 p-2" placeholder="mystore" />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">.trae.com</span>
              </div>
            </div>
            <div>
              <label htmlFor="custom-domain" className="block text-sm font-medium text-gray-700">Custom Domain</label>
              <input type="text" id="custom-domain" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="www.mycustomstore.com" />
            </div>
            <div>
              <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700">Brand Color</label>
              <input type="color" id="brand-color" className="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm" defaultValue="#6366F1" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
          </form>
        </section>

        {/* Contact & Social Media Section */}
        <section id="contact-social" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Contact & Social Media</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="business-email" className="block text-sm font-medium text-gray-700">Business Email</label>
              <input type="email" id="business-email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="contact@yourstore.com" />
            </div>
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" id="phone-number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Social Links</label>
              <input type="url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2" placeholder="WhatsApp Link" />
              <input type="url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2" placeholder="Instagram Link" />
              <input type="url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Facebook Link" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
          </form>
        </section>

        {/* Security & Danger Zone Section */}
        <section id="security-danger" className="mb-10 p-6 bg-white rounded-lg shadow border-2 border-red-200">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-red-700">Security & Danger Zone</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="password-protection" className="text-sm font-medium text-gray-700">Store password protection</label>
              {/* Toggle switch placeholder */}
              <label htmlFor="toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="toggle" className="sr-only" />
                  <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                </div>
              </label>
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete Store</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;