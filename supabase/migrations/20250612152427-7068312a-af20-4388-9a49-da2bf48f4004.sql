
-- First, let's add the slug column without the unique constraint
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

-- Generate unique slugs by adding a counter for duplicates
WITH numbered_products AS (
  SELECT 
    id,
    store_id,
    LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')) as base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY store_id, LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
      ORDER BY created_at
    ) as rn
  FROM products
  WHERE slug IS NULL
)
UPDATE products 
SET slug = CASE 
  WHEN numbered_products.rn = 1 THEN numbered_products.base_slug
  ELSE numbered_products.base_slug || '-' || numbered_products.rn
END
FROM numbered_products
WHERE products.id = numbered_products.id;

-- Now create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS products_store_slug_unique ON products(store_id, slug);

-- Make slug column NOT NULL after populating existing records
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
