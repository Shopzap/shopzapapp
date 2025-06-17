
-- Fix the security issue with handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Create payout_requests table for weekly payouts
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    order_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    screenshot_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_seller_id ON public.payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_store_id ON public.payout_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_week_dates ON public.payout_requests(week_start_date, week_end_date);

-- Add trigger for updated_at
CREATE TRIGGER update_payout_requests_updated_at
    BEFORE UPDATE ON public.payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create payout_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.payout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_request_id UUID NOT NULL REFERENCES public.payout_requests(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for payout logs
CREATE INDEX IF NOT EXISTS idx_payout_logs_payout_request_id ON public.payout_logs(payout_request_id);

-- Create function to calculate platform fee (3.9%)
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
    RETURN ROUND(amount * 0.039, 2);
END;
$$;

-- Create function to check if order is eligible for payout (7 days after delivery)
CREATE OR REPLACE FUNCTION public.is_order_payout_eligible(order_delivered_at TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
    RETURN order_delivered_at IS NOT NULL AND 
           order_delivered_at + INTERVAL '7 days' <= now();
END;
$$;

-- Create function to generate weekly payout requests
CREATE OR REPLACE FUNCTION public.generate_weekly_payout_requests()
RETURNS TABLE(
    store_id UUID,
    seller_id UUID,
    total_earned NUMERIC,
    platform_fee NUMERIC,
    final_amount NUMERIC,
    order_ids UUID[],
    orders_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH eligible_orders AS (
        SELECT 
            o.id,
            o.store_id,
            s.user_id as seller_id,
            o.total_price,
            o.delivered_at
        FROM public.orders o
        JOIN public.stores s ON o.store_id = s.id
        WHERE o.status = 'delivered'
            AND o.delivered_at IS NOT NULL
            AND public.is_order_payout_eligible(o.delivered_at)
            AND NOT EXISTS (
                SELECT 1 FROM public.payout_requests pr 
                WHERE o.id = ANY(pr.order_ids)
            )
    ),
    payout_summary AS (
        SELECT 
            eo.store_id,
            eo.seller_id,
            SUM(eo.total_price) as total_earned,
            public.calculate_platform_fee(SUM(eo.total_price)) as platform_fee,
            SUM(eo.total_price) - public.calculate_platform_fee(SUM(eo.total_price)) as final_amount,
            ARRAY_AGG(eo.id) as order_ids,
            COUNT(eo.id)::INTEGER as orders_count
        FROM eligible_orders eo
        GROUP BY eo.store_id, eo.seller_id
        HAVING SUM(eo.total_price) > 0
    )
    SELECT 
        ps.store_id,
        ps.seller_id,
        ps.total_earned,
        ps.platform_fee,
        ps.final_amount,
        ps.order_ids,
        ps.orders_count
    FROM payout_summary ps;
END;
$$;

-- Enable RLS on payout tables
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payout_requests
CREATE POLICY "Sellers can view their own payout requests"
    ON public.payout_requests
    FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all payout requests"
    ON public.payout_requests
    FOR ALL
    USING (
        auth.jwt() ->> 'email' IN ('shaikhsadique730@gmail.com', 'shaikhumairthisside@gmail.com')
    );

-- Create RLS policies for payout_logs
CREATE POLICY "Admins can view all payout logs"
    ON public.payout_logs
    FOR ALL
    USING (
        auth.jwt() ->> 'email' IN ('shaikhsadique730@gmail.com', 'shaikhumairthisside@gmail.com')
    );

CREATE POLICY "Sellers can view logs for their payout requests"
    ON public.payout_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.payout_requests pr 
            WHERE pr.id = payout_request_id 
            AND pr.seller_id = auth.uid()
        )
    );
