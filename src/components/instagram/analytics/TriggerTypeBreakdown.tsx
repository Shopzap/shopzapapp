
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TriggerStat {
  type: string;
  count: number;
}

interface TriggerTypeBreakdownProps {
  triggerStats: TriggerStat[];
}

const TriggerTypeBreakdown: React.FC<TriggerTypeBreakdownProps> = ({ triggerStats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Type Breakdown</CardTitle>
        <CardDescription>
          How your DMs are being triggered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {triggerStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No trigger data available yet
            </p>
          ) : (
            triggerStats.map((stat) => (
              <div key={stat.type} className="flex justify-between items-center">
                <span className="text-sm font-medium">{stat.type}</span>
                <span className="text-sm text-muted-foreground">{stat.count}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TriggerTypeBreakdown;
