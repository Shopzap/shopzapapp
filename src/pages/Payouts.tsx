
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowRight, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import PayoutHistory from "@/components/payouts/PayoutHistory";
import { useBankDetails } from "@/hooks/useBankDetails";

const Payouts = () => {
  const { bankDetails } = useBankDetails();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Payouts & Earnings
        </h1>
        <p className="text-gray-600 mt-2">
          Track your weekly payouts and earnings from ShopZap
        </p>
      </div>

      {/* Bank Details Alert */}
      {!bankDetails && (
        <Alert className="border-amber-200 bg-amber-50">
          <InfoIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex justify-between items-center">
              <span>Please add your bank details to receive payouts.</span>
              <Link to="/dashboard/bank-details">
                <Button variant="outline" size="sm" className="ml-4">
                  Add Bank Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            How Payouts Work
          </CardTitle>
          <CardDescription>
            Understanding ShopZap's weekly payout system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Payout Schedule</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Payouts are processed weekly after orders are delivered</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>7-day return period must complete before payout eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Payments are processed via bank transfer or UPI</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Platform Fees</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Platform Fee</span>
                  <span className="font-semibold text-gray-900">3.9%</span>
                </div>
                <div className="text-xs text-gray-500">
                  This fee covers payment processing, platform maintenance, and support services.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout History Component */}
      <PayoutHistory />
    </div>
  );
};

export default Payouts;
