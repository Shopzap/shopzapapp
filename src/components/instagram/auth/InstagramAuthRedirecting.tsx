
import React from 'react';
import { Loader2 } from 'lucide-react';

const InstagramAuthRedirecting = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Redirecting to Instagram...</h3>
        <p className="text-sm text-gray-600 mt-2">
          You'll be redirected to authorize your Instagram Business Account through SendPulse.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This may take a few seconds...
        </p>
      </div>
    </div>
  );
};

export default InstagramAuthRedirecting;
