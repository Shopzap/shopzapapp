
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { usePayouts } from "@/hooks/usePayouts";

const PayoutHistory = () => {
  const { payoutRequests, isLoading, totalEarned, pendingAmount, totalPlatformFees, stats } = usePayouts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">₹{totalEarned.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.paidPayouts} payouts completed</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pendingPayouts} pending payouts</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalPlatformFees.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">3.9% of total sales</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{(totalEarned + pendingAmount + totalPlatformFees).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Before platform fees</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payout History
          </CardTitle>
          <CardDescription>
            Track your weekly payouts and earnings from ShopZap
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutRequests && payoutRequests.length > 0 ? (
            <div className="space-y-4">
              {payoutRequests.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Week: {format(new Date(payout.week_start_date), 'MMM dd')} - {format(new Date(payout.week_end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{payout.order_ids.length} orders • Created {format(new Date(payout.created_at), 'PPP')}</p>
                        {payout.paid_at && (
                          <p className="text-green-600 font-medium">
                            Paid on {format(new Date(payout.paid_at), 'PPP')}
                          </p>
                        )}
                        {payout.admin_notes && (
                          <p className="text-gray-500 italic mt-1">Note: {payout.admin_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-green-600">₹{payout.final_amount.toLocaleString()}</p>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>Gross: ₹{payout.total_earned.toLocaleString()}</p>
                        <p>Fee: ₹{payout.platform_fee.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No payout history yet</p>
              <p className="text-sm text-gray-400">
                Your payouts will appear here after orders are delivered and the 7-day return period ends
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutHistory;
