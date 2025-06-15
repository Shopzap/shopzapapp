
import React from 'react';
import { CheckCircle } from 'lucide-react';

const InstagramAuthNextSteps = () => {
  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-sm mb-3 flex items-center">
        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
        What happens next?
      </h4>
      <ul className="text-xs text-gray-600 space-y-2">
        <li className="flex items-start">
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          You'll authorize ShopZap to access your Instagram Business Account
        </li>
        <li className="flex items-start">
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          This enables automated DM responses and comment replies
        </li>
        <li className="flex items-start">
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          You'll be redirected back to your dashboard once complete
        </li>
        <li className="flex items-start">
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          Your data is encrypted and stored securely
        </li>
      </ul>
    </div>
  );
};

export default InstagramAuthNextSteps;
