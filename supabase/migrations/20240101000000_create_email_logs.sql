
-- Create email_logs table to track all email sending
CREATE TABLE email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  event_type text NOT NULL,
  order_id uuid REFERENCES orders(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  error_message text,
  mailersend_id text
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX idx_email_logs_event_type ON email_logs(event_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for email logs (only accessible by authenticated users)
CREATE POLICY "Users can view email logs for their stores" ON email_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    JOIN stores ON orders.store_id = stores.id
    WHERE orders.id = email_logs.order_id
    AND stores.user_id = auth.uid()
  )
);
