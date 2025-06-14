
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Items Skeleton */}
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="w-16 h-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}

          {/* Payment Method Skeleton */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Fields Skeleton */}
          {[1, 2, 3, 4, 5, 6].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          
          {/* Submit Button Skeleton */}
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};
