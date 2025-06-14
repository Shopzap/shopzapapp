
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { Edit, ArrowLeft } from 'lucide-react';

const CorrectionPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <ResponsiveLayout>
      <div className="max-w-md mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit />
              Correct Order
            </CardTitle>
            <CardDescription>Order ID: {orderId}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>An order correction form will be available here soon.</p>
            <p className="mt-4 text-sm text-muted-foreground">
              This feature is currently in development. Please contact support for any immediate changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default CorrectionPage;
