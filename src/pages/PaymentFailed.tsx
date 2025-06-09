
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Payment processing failed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-muted-foreground">
          Unfortunately, your payment could not be processed at this time.
        </p>
      </div>

      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">What went wrong?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{reason}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What can you do?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Check your internet connection and try again</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Verify your card details are correct</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Ensure you have sufficient balance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Contact your bank if the issue persists</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Try using a different payment method</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button 
          onClick={() => navigate(-1)}
          className="flex-1"
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Payment Again
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex-1"
          size="lg"
        >
          <Home className="mr-2 h-4 w-4" />
          Go to Home
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Need help? Contact our support team
        </p>
        <Button variant="link" onClick={() => navigate('/contact')}>
          Get Support
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailed;
