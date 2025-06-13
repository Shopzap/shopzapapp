
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TestTube, CheckCircle, XCircle, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const InstagramAutomationTest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get user's store
        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (!storeData) {
          toast({
            title: "Store not found",
            description: "Please complete seller onboarding first",
            variant: "destructive"
          });
          navigate('/onboarding');
          return;
        }
        
        // Fetch Instagram connections
        const { data: connectionsData, error } = await supabase
          .from('instagram_connections')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching connections:', error);
          toast({
            title: "Error loading connections",
            description: "Please try refreshing the page",
            variant: "destructive"
          });
          return;
        }
        
        setConnections(connectionsData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConnections();
  }, [navigate, toast]);

  const testConnection = async (connection: any) => {
    setIsTesting(true);
    
    try {
      // Test the access token by calling SendPulse userinfo endpoint
      const response = await fetch('https://api.sendpulse.com/userinfo', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      });

      const result = {
        connectionId: connection.id,
        isValid: response.ok,
        status: response.status,
        timestamp: new Date().toISOString(),
        userInfo: response.ok ? await response.json() : null,
        error: !response.ok ? `HTTP ${response.status}` : null,
      };

      setTestResults(prev => [result, ...prev.filter(r => r.connectionId !== connection.id)]);

      if (result.isValid) {
        toast({
          title: "Connection valid",
          description: `Access token for ${connection.ig_username} is working`,
        });
      } else {
        toast({
          title: "Connection invalid",
          description: `Access token for ${connection.ig_username} has expired or is invalid`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Test error:', error);
      const result = {
        connectionId: connection.id,
        isValid: false,
        timestamp: new Date().toISOString(),
        error: 'Network error or CORS issue',
      };

      setTestResults(prev => [result, ...prev.filter(r => r.connectionId !== connection.id)]);

      toast({
        title: "Test failed",
        description: "Unable to test connection due to network error",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getTestResult = (connectionId: string) => {
    return testResults.find(r => r.connectionId === connectionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Instagram Connection Test</h1>
        <p className="text-muted-foreground">
          Test your Instagram connections to ensure access tokens are valid
        </p>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Instagram connections found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Connect your Instagram account first to test the integration
            </p>
            <Button onClick={() => navigate('/instagram-automation')}>
              Go to Instagram Automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => {
            const testResult = getTestResult(connection.id);
            
            return (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <TestTube className="h-5 w-5" />
                        <span>@{connection.ig_username || 'Unknown'}</span>
                        {connection.connected ? (
                          <Badge variant="default">Connected</Badge>
                        ) : (
                          <Badge variant="secondary">Disconnected</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Connected on {new Date(connection.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => testConnection(connection)}
                      disabled={isTesting}
                      size="sm"
                    >
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Email:</p>
                      <p>{connection.email || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Page Name:</p>
                      <p>{connection.page_name || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Instagram Page ID:</p>
                      <p className="font-mono text-xs">{connection.instagram_page_id || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Last Updated:</p>
                      <p>{new Date(connection.updated_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {testResult && (
                    <div className={`p-4 rounded-lg border ${
                      testResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {testResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          testResult.isValid ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {testResult.isValid ? 'Access token is valid' : 'Access token is invalid'}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Tested at:</span> {' '}
                          {new Date(testResult.timestamp).toLocaleString()}
                        </p>
                        {testResult.status && (
                          <p>
                            <span className="font-medium">HTTP Status:</span> {testResult.status}
                          </p>
                        )}
                        {testResult.error && (
                          <p className="text-red-700">
                            <span className="font-medium">Error:</span> {testResult.error}
                          </p>
                        )}
                        {testResult.userInfo && (
                          <p className="text-green-700">
                            <span className="font-medium">User:</span> {testResult.userInfo.email || 'Unknown'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate('/instagram-automation')}>
          Back to Instagram Automation
        </Button>
      </div>
    </div>
  );
};

export default InstagramAutomationTest;
