"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  FileText,
  Loader2
} from 'lucide-react';

interface ServerStatus {
  status: 'online' | 'offline' | 'error';
  server_url: string;
  health?: any;
  last_checked: string;
  uptime?: number;
  version?: string;
  memory_usage?: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu_usage?: number;
  error?: string;
}

interface ServerLogs {
  success: boolean;
  logs: string[];
  total_lines: number;
  requested_lines: number;
  log_type: string;
  error?: string;
}

export default function SyncServerManager() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [serverLogs, setServerLogs] = useState<ServerLogs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch server status
  const fetchServerStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync-server/status');
      const data = await response.json();
      
      if (response.ok) {
        setServerStatus(data);
        setLastUpdate(new Date());
      } else {
        toast.error(data.error || 'Failed to fetch server status');
      }
    } catch (error) {
      console.error('Error fetching server status:', error);
      toast.error('Failed to fetch server status');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch server logs
  const fetchServerLogs = async (type: string = 'server', lines: number = 50) => {
    try {
      const response = await fetch(`/api/sync-server/logs?type=${type}&lines=${lines}`);
      const data = await response.json();
      
      if (response.ok) {
        setServerLogs(data);
      } else {
        toast.error(data.error || 'Failed to fetch server logs');
      }
    } catch (error) {
      console.error('Error fetching server logs:', error);
      toast.error('Failed to fetch server logs');
    }
  };

  // Control server action
  const controlServer = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    try {
      setIsActionLoading(action);
      const response = await fetch('/api/sync-server/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Server ${action} command executed successfully`);
        // Refresh status after action
        setTimeout(() => {
          fetchServerStatus();
        }, 2000);
      } else {
        toast.error(data.error || `Failed to ${action} server`);
      }
    } catch (error) {
      console.error(`Error ${action}ing server:`, error);
      toast.error(`Failed to ${action} server`);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    fetchServerStatus();
    fetchServerLogs();

    const interval = setInterval(() => {
      fetchServerStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!serverStatus) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (serverStatus.status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!serverStatus) return <Badge variant="secondary">Checking...</Badge>;
    
    switch (serverStatus.status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'error':
        return <Badge className="bg-yellow-500">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Server Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <CardTitle>Sync Server Status</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchServerStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Server URL</span>
                </div>
                <p className="text-sm text-muted-foreground">{serverStatus.server_url}</p>
              </div>

              {serverStatus.uptime && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatUptime(serverStatus.uptime)}
                  </p>
                </div>
              )}

              {serverStatus.version && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{serverStatus.version}</p>
                </div>
              )}

              {serverStatus.memory_usage && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={serverStatus.memory_usage.percentage} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(serverStatus.memory_usage.used)} / {formatBytes(serverStatus.memory_usage.total)}
                    </p>
                  </div>
                </div>
              )}

              {serverStatus.cpu_usage && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={serverStatus.cpu_usage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {serverStatus.cpu_usage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {serverStatus?.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{serverStatus.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Server Control Card */}
      <Card>
        <CardHeader>
          <CardTitle>Server Control</CardTitle>
          <CardDescription>
            Start, stop, restart, or kill the sync server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => controlServer('start')}
              disabled={isActionLoading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActionLoading === 'start' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Server
            </Button>

            <Button
              onClick={() => controlServer('stop')}
              disabled={isActionLoading !== null}
              variant="outline"
            >
              {isActionLoading === 'stop' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Stop Server
            </Button>

            <Button
              onClick={() => controlServer('restart')}
              disabled={isActionLoading !== null}
              variant="outline"
            >
              {isActionLoading === 'restart' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restart Server
            </Button>

            <Button
              onClick={() => controlServer('kill')}
              disabled={isActionLoading !== null}
              variant="destructive"
            >
              {isActionLoading === 'kill' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Kill Process
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Server Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Server Logs</CardTitle>
          <CardDescription>
            View real-time server logs and error messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="server" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="server">Server Logs</TabsTrigger>
              <TabsTrigger value="error">Error Logs</TabsTrigger>
              <TabsTrigger value="access">Access Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="server" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Server Logs (Last 50 lines)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchServerLogs('server', 50)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  {serverLogs?.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))}
                  {!serverLogs?.logs.length && (
                    <div className="text-gray-500">No logs available</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="error" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Error Logs (Last 50 lines)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchServerLogs('error', 50)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-black text-red-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  {serverLogs?.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))}
                  {!serverLogs?.logs.length && (
                    <div className="text-gray-500">No error logs available</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="access" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Access Logs (Last 50 lines)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchServerLogs('access', 50)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-black text-blue-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  {serverLogs?.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))}
                  {!serverLogs?.logs.length && (
                    <div className="text-gray-500">No access logs available</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
