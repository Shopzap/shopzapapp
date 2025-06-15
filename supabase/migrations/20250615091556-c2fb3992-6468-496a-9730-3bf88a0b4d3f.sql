
-- Add a 'product_type' column to the products table to differentiate between simple and variant products.
ALTER TABLE public.products
ADD COLUMN product_type TEXT NOT NULL DEFAULT 'simple';

-- Create a new table to store all product variants.
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    inventory_count INTEGER NOT NULL DEFAULT 0,
    sku TEXT,
    image_url TEXT,
    options JSONB, -- Example: {"Color": "Red", "Size": "Small"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add an index for faster lookups on variants by product_id.
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- Enable Row Level Security on the new variants table.
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all variants for the storefront.
CREATE POLICY "Allow public read access to product variants"
ON public.product_variants
FOR SELECT USING (true);

-- Policy: Allow users to manage (create, update, delete) variants for their own products.
CREATE POLICY "Users can manage variants for their own products"
ON public.product_variants
FOR ALL
USING (auth.uid() = (SELECT user_id FROM products WHERE id = product_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM products WHERE id = product_id));

-- Update the order_items table to track which specific variant was purchased.
-- This is nullable to support existing orders made before the variants system.
ALTER TABLE public.order_items
ADD COLUMN product_variant_id UUID NULL REFERENCES public.product_variants(id);
