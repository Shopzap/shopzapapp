import React from "react";

interface StorefrontContentProps {
  store: {
    name: string;
    logo_image: string | null;
    banner_image: string | null;
    description: string | null;
  };
  products: Array<{
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
  }>;
}

const StorefrontContent: React.FC<StorefrontContentProps> = ({ store, products }) => {
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Banner */}
      <div
        className="w-full h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${store.banner_image || ''})` }}
      >
        <div className="absolute inset-0 bg-black/30 flex items-end p-4 text-white">
          <img
            src={store.logo_image || ''}
            alt="Avatar"
            className="w-14 h-14 rounded-full border-2 border-white mr-3"
          />
          <div>
            <h1 className="text-2xl font-semibold">{store.name}</h1>
            <p className="text-sm">{store.description}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300"
            >
              <img
                 src={item.image_url || ''}
                 alt={item.name}
                 className="w-full h-48 object-cover rounded-t-xl"
               />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-500 mb-1">{item.description}</p>
                <p className="text-purple-600 font-bold mb-2">${item.price}</p>
                <div className="flex items-center justify-between">
                  <button className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                    View Details
                  </button>
                  <button className="text-sm text-gray-500 hover:text-red-500">
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        © {new Date().getFullYear()} {store.name}. Powered by ShopZap.
      </footer>
    </div>
  );
};

export default StorefrontContent;