
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramAuthNextSteps = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Instagram className="h-4 w-4" />
        <AlertDescription>
          <strong>Instagram Integration Coming Soon!</strong>
          <br />
          We're working on a new Instagram automation solution. Stay tuned for updates.
        </AlertDescription>
      </Alert>
      
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          Meanwhile, you can explore these alternatives:
        </p>
        
        <div className="space-y-2">
          <Button 
            variant="outline"
            className="w-full"
            asChild
          >
            <a href="https://business.instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4 mr-2" />
              Instagram Business
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstagramAuthNextSteps;
