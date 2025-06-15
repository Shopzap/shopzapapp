
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, ExternalLink, AlertCircle } from 'lucide-react';

interface InstagramAuthErrorProps {
  error: string;
  onRetry: () => void;
  onManualRedirect: () => void;
  onGoToDashboard: () => void;
}

const InstagramAuthError: React.FC<InstagramAuthErrorProps> = ({
  error,
  onRetry,
  onManualRedirect,
  onGoToDashboard,
}) => {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          Having trouble? Try one of the options below:
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={onRetry}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Instagram className="h-4 w-4 mr-2" />
            Retry Authorization
          </Button>
          
          <Button 
            onClick={onManualRedirect}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Manual Redirect
          </Button>
          
          <Button 
            onClick={onGoToDashboard}
            variant="ghost"
            className="w-full text-sm"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstagramAuthError;
