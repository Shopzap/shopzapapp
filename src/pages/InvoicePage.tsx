
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { FileText, ArrowLeft } from 'lucide-react';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <ResponsiveLayout maxWidth="md" padding="md">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText />
            Invoice
          </CardTitle>
          <CardDescription>Order ID: {orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Invoice details will be displayed here.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Note: Full PDF invoice generation and download is a feature currently in development.
          </p>
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
};

export default InvoicePage;
