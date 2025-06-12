
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users } from 'lucide-react';

interface ReelsAutomationSectionProps {
  storeData: any;
  igConnection: any;
}

const ReelsAutomationSection: React.FC<ReelsAutomationSectionProps> = ({
  storeData,
  igConnection
}) => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Advanced Automation Features</span>
          </CardTitle>
          <CardDescription>
            Additional automation features are coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Play className="h-8 w-8 opacity-50" />
                <Users className="h-8 w-8 opacity-50" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Coming Soon</h3>
                <p className="text-sm">
                  We're working on advanced features like:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Post & Reel comment automation</li>
                  <li>• Story reply automation</li>
                  <li>• Welcome message for new followers</li>
                  <li>• Advanced trigger conditions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReelsAutomationSection;
