
-- Fix the generate_slug function to have a secure search path
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(trim(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g')))
         |> regexp_replace('\s+', '-', 'g');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
