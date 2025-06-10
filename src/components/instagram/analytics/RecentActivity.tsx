
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DmLog {
  id: string;
  trigger_type: string;
  message_sent: unknown;
  created_at: string;
}

interface RecentActivityProps {
  dmLogs: DmLog[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ dmLogs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest automated DM activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {dmLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            dmLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="border-l-2 border-blue-200 pl-3 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {log.trigger_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.message_sent 
                        ? `${String(log.message_sent).substring(0, 50)}...` 
                        : 'DM sent'
                      }
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
