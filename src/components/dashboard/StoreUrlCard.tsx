
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from 'lucide-react';

interface StoreUrlCardProps {
  storeData: any;
}

const StoreUrlCard: React.FC<StoreUrlCardProps> = ({ storeData }) => {
  const { toast } = useToast();

  const getStoreUrl = (includeOrigin: boolean = true): string => {
    const storeUrl = `/store/${storeData.username}`;
    return includeOrigin ? `${window.location.origin}${storeUrl}` : storeUrl;
  };

  const handleCopyStoreLink = () => {
    if (storeData) {
      const storeLink = getStoreUrl(true);
      navigator.clipboard.writeText(storeLink);
      toast({ title: "Store link copied!" });
    }
  };

  const handleOpenStore = () => {
    if (storeData) {
      const storeLink = getStoreUrl(true);
      window.open(storeLink, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Your Store Link</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm flex-1 truncate w-full">
            {getStoreUrl(true)}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleCopyStoreLink} className="flex-1">
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenStore} className="flex-1">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreUrlCard;
