
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import InstagramAuthNextSteps from "@/components/instagram/auth/InstagramAuthNextSteps";

const InstagramAutomation = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Instagram Automation</h1>
        <p className="text-muted-foreground">
          Instagram integration features are currently being rebuilt with a new solution
        </p>
      </div>

      {/* Integration Status Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Update:</strong> We're developing a new Instagram automation solution that will provide 
          better reliability and more features. Check back soon for updates!
        </AlertDescription>
      </Alert>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Instagram className="h-5 w-5" />
            <span>Instagram Integration</span>
          </CardTitle>
          <CardDescription>
            Connect your Instagram Business Account for automated responses and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstagramAuthNextSteps />
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramAutomation;
