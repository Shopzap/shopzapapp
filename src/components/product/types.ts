
export interface ProductVariant {
  id?: string;
  product_id?: string;
  price: number;
  inventory_count: number;
  sku?: string;
  image_url?: string;
  options: { [key: string]: string };
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  category?: string;
  sku?: string;
  inventory_count?: number;
  status: string;
  payment_method?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  user_id?: string;
  product_type?: 'simple' | 'variant';
  variants?: ProductVariant[];
  stores?: {
    id: string;
    name: string;
    tagline?: string;
  };
}
