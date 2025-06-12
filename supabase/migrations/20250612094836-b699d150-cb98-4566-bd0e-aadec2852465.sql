
-- Drop existing policies first, then recreate them
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Store owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order items creation" ON public.order_items;
DROP POLICY IF EXISTS "Store owners can view their order items" ON public.order_items;

-- Create RLS policies for the orders table to allow order creation
-- Policy to allow anyone to insert orders (for checkout functionality)
CREATE POLICY "Allow order creation" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow store owners to view their store orders
CREATE POLICY "Store owners can view their orders" 
  ON public.orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = orders.store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Policy to allow store owners to update their store orders
CREATE POLICY "Store owners can update their orders" 
  ON public.orders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = orders.store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Also create policies for order_items table if it has RLS enabled
CREATE POLICY "Allow order items creation" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Store owners can view their order items" 
  ON public.order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.stores s ON s.id = o.store_id
      WHERE o.id = order_items.order_id 
      AND s.user_id = auth.uid()
    )
  );
