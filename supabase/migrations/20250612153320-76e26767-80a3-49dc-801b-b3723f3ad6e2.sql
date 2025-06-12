
-- Add inventory_count column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_count integer DEFAULT 0;
