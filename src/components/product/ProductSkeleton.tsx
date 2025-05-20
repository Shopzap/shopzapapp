
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProductSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0 justify-between">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductSkeleton;
