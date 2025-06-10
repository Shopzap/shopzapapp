
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Instagram, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  storeId: string;
}

const InstagramConnect = ({ storeId }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ['instagram-connections', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_connections')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('instagram_connections')
        .delete()
        .eq('id', connectionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-connections', storeId] });
      toast({
        title: "Disconnected",
        description: "Instagram page has been disconnected successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram page.",
        variant: "destructive",
      });
    },
  });

  const handleManyCharConnect = () => {
    // Redirect to ManyChat OAuth flow
    const manyChatUrl = `https://manychat.com/fb/oauth/authorize?client_id=YOUR_MANYCHAT_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/instagram-callback')}&scope=pages_messaging,instagram_basic,instagram_manage_messages`;
    window.open(manyChatUrl, '_blank', 'width=600,height=700');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-600" />
            Connect Instagram via ManyChat
          </CardTitle>
          <CardDescription>
            Connect your Instagram business account through ManyChat to enable automated DM responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections?.length === 0 ? (
            <div className="text-center py-8">
              <Instagram className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Instagram Account Connected</h3>
              <p className="text-muted-foreground mb-6">
                Connect your Instagram business account through ManyChat to start automating your DMs.
              </p>
              <Button onClick={handleManyCharConnect} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect via ManyChat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections?.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold">{connection.page_name || 'Instagram Page'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Connected on {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={connection.is_active ? "default" : "secondary"}>
                      {connection.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => disconnectMutation.mutate(connection.id)}
                    disabled={disconnectMutation.isPending}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
              <Button 
                onClick={handleManyCharConnect} 
                variant="outline" 
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Another Page
              </Button>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Click "Connect via ManyChat" to open ManyChat OAuth</li>
                <li>Login to ManyChat and select your Instagram business account</li>
                <li>Grant necessary permissions for messaging and automation</li>
                <li>You'll be redirected back to complete the setup</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramConnect;
