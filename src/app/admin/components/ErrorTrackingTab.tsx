"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search, 
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  Users,
  Globe,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface ErrorLog {
  id: string;
  error_id: string;
  error_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  stack_trace?: string;
  file_path?: string;
  line_number?: number;
  function_name?: string;
  component_name?: string;
  page_url: string;
  user_id?: string;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  country_code?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  device_type?: string;
  screen_resolution?: string;
  viewport_size?: string;
  console_logs?: any[];
  network_logs?: any[];
  performance_metrics?: any;
  error_context?: any;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ErrorStats {
  total_errors: number;
  critical_errors: number;
  high_errors: number;
  medium_errors: number;
  low_errors: number;
  resolved_errors: number;
  unresolved_errors: number;
  unique_users: number;
  unique_sessions: number;
  avg_resolution_time?: string;
}

interface ErrorTrend {
  date: string;
  total_errors: number;
  critical_errors: number;
  high_errors: number;
  medium_errors: number;
  low_errors: number;
}

export default function ErrorTrackingTab() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [trends, setTrends] = useState<ErrorTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  useEffect(() => {
    fetchErrors();
    fetchStats();
    fetchTrends();
  }, []);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch errors: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_error_statistics');
      if (error) throw error;
      setStats(data?.[0] || null);
    } catch (error: any) {
      console.error('Failed to fetch error stats:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase.rpc('get_error_trends', { days: 7 } as any);
      if (error) throw error;
      setTrends(data || []);
    } catch (error: any) {
      console.error('Failed to fetch error trends:', error);
    }
  };

  const markAsResolved = async (errorId: string, notes?: string) => {
    try {
      const { error } = await (supabase as any)
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', errorId);

      if (error) throw error;
      
      toast.success('Error marked as resolved');
      fetchErrors();
      fetchStats();
    } catch (error: any) {
      toast.error(`Failed to resolve error: ${error.message}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = searchTerm === '' || 
      error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.error_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter;
    const matchesType = typeFilter === 'all' || error.error_type === typeFilter;
    const matchesResolved = resolvedFilter === 'all' || 
      (resolvedFilter === 'resolved' && error.resolved) ||
      (resolvedFilter === 'unresolved' && !error.resolved);

    return matchesSearch && matchesSeverity && matchesType && matchesResolved;
  });

  const toggleErrorExpansion = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Error Tracking</h2>
          <p className="text-muted-foreground">Monitor and manage application errors</p>
        </div>
        <Button onClick={fetchErrors} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_errors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unresolved_errors} unresolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.critical_errors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.high_errors} high severity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolved_errors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.avg_resolution_time ? `Avg: ${stats.avg_resolution_time}` : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unique_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unique_sessions} sessions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({filteredErrors.length})</CardTitle>
          <CardDescription>
            Click on an error to view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredErrors.map((error) => (
                <Card key={error.id} className={`${error.resolved ? 'opacity-60' : ''}`}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleErrorExpansion(error.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{error.error_type}</Badge>
                          {error.resolved && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{error.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {error.message}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}</div>
                          <div className="flex items-center space-x-1">
                            {getDeviceIcon(error.device_type)}
                            <span>{error.browser}</span>
                          </div>
                        </div>
                        {expandedErrors.has(error.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <Collapsible open={expandedErrors.has(error.id)}>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Error Details</h4>
                            <div className="space-y-2 text-sm">
                              <div><strong>Error ID:</strong> {error.error_id}</div>
                              <div><strong>File:</strong> {error.file_path || 'N/A'}</div>
                              <div><strong>Line:</strong> {error.line_number || 'N/A'}</div>
                              <div><strong>Function:</strong> {error.function_name || 'N/A'}</div>
                              <div><strong>Component:</strong> {error.component_name || 'N/A'}</div>
                              <div><strong>URL:</strong> {error.page_url}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">User Context</h4>
                            <div className="space-y-2 text-sm">
                              <div><strong>User ID:</strong> {error.user_id || 'Anonymous'}</div>
                              <div><strong>Session:</strong> {error.session_id || 'N/A'}</div>
                              <div><strong>IP:</strong> {error.ip_address || 'N/A'}</div>
                              <div><strong>Country:</strong> {error.country_code || 'N/A'}</div>
                              <div><strong>OS:</strong> {error.os || 'N/A'}</div>
                              <div><strong>Resolution:</strong> {error.screen_resolution || 'N/A'}</div>
                            </div>
                          </div>
                        </div>

                        {error.stack_trace && (
                          <div>
                            <h4 className="font-semibold mb-2">Stack Trace</h4>
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                              {error.stack_trace}
                            </pre>
                          </div>
                        )}

                        {error.console_logs && error.console_logs.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Console Logs</h4>
                            <div className="bg-muted p-3 rounded max-h-40 overflow-auto">
                              {error.console_logs.map((log, index) => (
                                <div key={index} className="text-xs mb-1">
                                  <span className="text-muted-foreground">[{log.timestamp}]</span>
                                  <span className={`ml-2 ${
                                    log.level === 'error' ? 'text-red-500' :
                                    log.level === 'warn' ? 'text-yellow-500' :
                                    'text-foreground'
                                  }`}>
                                    {log.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {error.network_logs && error.network_logs.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Network Logs</h4>
                            <div className="bg-muted p-3 rounded max-h-40 overflow-auto">
                              {error.network_logs.map((log, index) => (
                                <div key={index} className="text-xs mb-1">
                                  <span className="text-muted-foreground">[{log.timestamp}]</span>
                                  <span className="ml-2">
                                    {log.method} {log.url} - {log.status} ({log.duration}ms)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!error.resolved && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => markAsResolved(error.id, 'Marked as resolved by admin')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Resolved
                            </Button>
                          </div>
                        )}

                        {error.resolved && error.resolution_notes && (
                          <div>
                            <h4 className="font-semibold mb-2">Resolution Notes</h4>
                            <p className="text-sm text-muted-foreground">{error.resolution_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {filteredErrors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No errors found matching your filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
