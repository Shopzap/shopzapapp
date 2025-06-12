
-- Remove the slug column and its unique index from stores table
DROP INDEX IF EXISTS products_store_slug_unique;
ALTER TABLE stores DROP COLUMN IF EXISTS slug;

-- Update any existing products that might reference the old slug system
-- This ensures all products work with the username-based system
UPDATE products SET updated_at = now() WHERE store_id IS NOT NULL;

-- Ensure usernames are properly formatted (lowercase, no spaces)
UPDATE stores SET username = LOWER(REPLACE(username, ' ', '')) WHERE username IS NOT NULL;

-- Add a unique constraint on username if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS stores_username_unique ON stores(username);
