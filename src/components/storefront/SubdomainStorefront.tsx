
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { getSubdomain } from "@/utils/subdomainUtils";
import SubdomainStoreHome from "./SubdomainStoreHome";
import SubdomainProductPage from "./SubdomainProductPage";
import SubdomainCart from "./SubdomainCart";
import SubdomainCheckout from "./SubdomainCheckout";
import NotFound from "@/pages/NotFound";
import { Tables } from "@/integrations/supabase/types";

const SubdomainStorefront = () => {
  const subdomain = getSubdomain();
  
  // Fetch store data based on subdomain
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['subdomainStore', subdomain],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('No subdomain found');
      }
      
      console.log('SubdomainStorefront: Fetching store with subdomain', subdomain);
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', subdomain)
        .single();
        
      if (error) {
        console.error('SubdomainStorefront: Error fetching store', error);
        throw error;
      }
      
      console.log('SubdomainStorefront: Store data received', data);
      return data;
    },
    enabled: !!subdomain,
    retry: 2,
    retryDelay: 1000,
  });
  
  // Fetch products for the store
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['subdomainProducts', store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      
      console.log('SubdomainStorefront: Fetching products for store ID', store.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('SubdomainStorefront: Error fetching products', error);
        return [];
      }
      
      // Filter for public display
      const publicProducts = (data || []).filter(product => {
        return product.is_published !== false && 
               product.status !== 'inactive' &&
               product.name &&
               product.id;
      });
      
      console.log('SubdomainStorefront: Public products count:', publicProducts.length);
      return publicProducts;
    },
    enabled: !!store?.id,
    retry: 2,
  });
  
  // Show error page if store not found or no subdomain
  if (!subdomain || storeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
        <p className="text-gray-600 mb-6">
          {!subdomain ? 'Invalid store URL' : 'The store you\'re looking for doesn\'t exist.'}
        </p>
        <button 
          onClick={() => window.location.href = 'https://shopzap.io'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to ShopZap
        </button>
      </div>
    );
  }
  
  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Loading store...</p>
      </div>
    );
  }
  
  if (!store) {
    return <NotFound />;
  }

  const safeProducts = Array.isArray(products) ? products as Tables<'products'>[] : [];

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <SubdomainStoreHome 
            store={store} 
            products={safeProducts} 
            isLoading={productsLoading}
          />
        } 
      />
      <Route 
        path="/:productSlug" 
        element={
          <SubdomainProductPage 
            store={store} 
            products={safeProducts}
          />
        } 
      />
      <Route 
        path="/cart" 
        element={<SubdomainCart store={store} />} 
      />
      <Route 
        path="/checkout" 
        element={<SubdomainCheckout store={store} />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default SubdomainStorefront;
