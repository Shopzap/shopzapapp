
-- Add a slug field to the stores table for clean, predictable URLs
ALTER TABLE stores ADD COLUMN slug text;

-- Create a unique index on the slug field
CREATE UNIQUE INDEX stores_slug_unique ON stores(slug);

-- Update existing stores to have slugs based on their username
-- This will handle the migration for existing stores
UPDATE stores 
SET slug = LOWER(REGEXP_REPLACE(username, '[^a-zA-Z0-9]', '', 'g'))
WHERE slug IS NULL;

-- For stores without username, use a cleaned version of the name
UPDATE stores 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Ensure no duplicate slugs by appending numbers where needed
WITH numbered_stores AS (
  SELECT id, slug, 
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM stores 
  WHERE slug IS NOT NULL
)
UPDATE stores 
SET slug = CASE 
  WHEN numbered_stores.rn = 1 THEN numbered_stores.slug
  ELSE numbered_stores.slug || '-' || numbered_stores.rn
END
FROM numbered_stores 
WHERE stores.id = numbered_stores.id;

-- Make slug NOT NULL after migration
ALTER TABLE stores ALTER COLUMN slug SET NOT NULL;
