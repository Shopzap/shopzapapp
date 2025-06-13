
-- First, let's handle duplicate usernames by adding incremental suffixes
WITH ranked_stores AS (
  SELECT id, username, name,
         ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
  FROM stores
),
updated_usernames AS (
  SELECT id,
         CASE 
           WHEN rn = 1 THEN username
           ELSE username || '-' || rn
         END as new_username
  FROM ranked_stores
)
UPDATE stores 
SET username = updated_usernames.new_username
FROM updated_usernames 
WHERE stores.id = updated_usernames.id;

-- Now add slug column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

-- Create a function to generate slug from product name
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(trim(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g')))
         |> regexp_replace('\s+', '-', 'g');
END;
$$ LANGUAGE plpgsql;

-- Update existing products to have slugs based on their names
UPDATE products 
SET slug = generate_slug(name) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Make slug column NOT NULL after populating existing data
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Create unique index on store_id + slug combination
CREATE UNIQUE INDEX IF NOT EXISTS products_store_slug_unique ON products(store_id, slug);
