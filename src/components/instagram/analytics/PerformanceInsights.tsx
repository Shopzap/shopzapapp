
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceInsightsProps {
  analytics: {
    totalDmsSent: number;
    orderConversions: number;
    linkClicks: number;
  } | null;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ analytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Insights</CardTitle>
        <CardDescription>
          Tips to improve your Instagram automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Optimization Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Use engaging keywords that your audience commonly uses</li>
              <li>• Keep your auto-reply messages short and friendly</li>
              <li>• Include clear call-to-actions in your DM responses</li>
              <li>• Test different message templates to see what works best</li>
            </ul>
          </div>

          {analytics?.totalDmsSent && analytics.totalDmsSent > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📈 Your Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-green-800">Conversion Rate</span>
                  <p className="font-bold text-green-900">
                    {analytics.totalDmsSent > 0 
                      ? ((analytics.orderConversions / analytics.totalDmsSent) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div>
                  <span className="text-sm text-green-800">Click-through Rate</span>
                  <p className="font-bold text-green-900">
                    {analytics.totalDmsSent > 0 
                      ? ((analytics.linkClicks / analytics.totalDmsSent) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
