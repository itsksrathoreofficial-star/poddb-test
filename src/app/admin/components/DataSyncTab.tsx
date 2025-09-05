"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { 
  RefreshCw, 
  Clock, 
  Calendar, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Timer,
  Users,
  Activity
} from 'lucide-react';
import { 
  startManualDataSyncAction,
  saveAutoSyncSettingsAction,
  getAutoSyncSettingsAction
} from '@/app/actions/data-sync';
import { supabase } from '@/integrations/supabase/client';

interface DataSyncTabProps {
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

interface AutoSyncSettings {
  enabled: boolean;
  schedule_type: 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  schedule_days: number[];
  schedule_day_of_month: number;
  max_retries: number;
  retry_delay_minutes: number;
  batch_size: number;
}

interface SyncStatus {
  isRunning: boolean;
  currentProgress: number;
  currentStatus: 'idle' | 'running' | 'completed' | 'failed';
  lastSyncTime: string;
  syncStats: {
    totalPodcasts: number;
    successfulPodcasts: number;
    failedPodcasts: number;
    totalEpisodes: number;
    successfulEpisodes: number;
    failedEpisodes: number;
  };
  serverUptime: number;
  serverTime: string;
}

interface DailyStats {
  date: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_watch_time: number;
  total_episodes: number;
  avg_engagement_rate: number;
  top_podcasts: Array<{
    podcast_id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
  }>;
}

export default function DataSyncTab({ isPending, startTransition }: DataSyncTabProps) {
  const [autoSyncSettings, setAutoSyncSettings] = useState<AutoSyncSettings>({
    enabled: false,
    schedule_type: 'daily',
    schedule_time: '02:00:00',
    schedule_days: [1, 2, 3, 4, 5, 6, 7],
    schedule_day_of_month: 1,
    max_retries: 3,
    retry_delay_minutes: 30,
    batch_size: 10
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    currentProgress: 0,
    currentStatus: 'idle',
    lastSyncTime: '',
    syncStats: {
      totalPodcasts: 0,
      successfulPodcasts: 0,
      failedPodcasts: 0,
      totalEpisodes: 0,
      successfulEpisodes: 0,
      failedEpisodes: 0
    },
    serverUptime: 0,
    serverTime: ''
  });

  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Fetch sync status from server
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  // Fetch auto sync settings
  const fetchAutoSyncSettings = async () => {
    try {
      const result = await getAutoSyncSettingsAction();
      if (result.success && 'data' in result && result.data) {
        setAutoSyncSettings(result.data as AutoSyncSettings);
      }
    } catch (error) {
      console.error('Error fetching auto sync settings:', error);
    }
  };

  // Fetch daily stats (YouTube Studio style)
  const fetchDailyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('podcast_daily_stats')
        .select(`
          date,
          views,
          likes,
          comments,
          total_watch_time,
          total_episodes,
          engagement_rate,
          podcast_id,
          podcasts!inner(title)
        `)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching daily stats:', error);
        return;
      }

      // Group by date and calculate totals
      const groupedData = data.reduce((acc: any, item: any) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            total_views: 0,
            total_likes: 0,
            total_comments: 0,
            total_watch_time: 0,
            total_episodes: 0,
            engagement_rates: [],
            podcasts: []
          };
        }
        
        acc[date].total_views += item.views || 0;
        acc[date].total_likes += item.likes || 0;
        acc[date].total_comments += item.comments || 0;
        acc[date].total_watch_time += item.total_watch_time || 0;
        acc[date].total_episodes += item.total_episodes || 0;
        acc[date].engagement_rates.push(item.engagement_rate || 0);
        acc[date].podcasts.push({
          podcast_id: item.podcast_id,
          title: item.podcasts?.title || 'Unknown',
          views: item.views || 0,
          likes: item.likes || 0,
          comments: item.comments || 0
        });
        
        return acc;
      }, {});

      // Process the grouped data
      const processedStats: DailyStats[] = Object.values(groupedData).map((day: any) => ({
        date: day.date,
        total_views: day.total_views,
        total_likes: day.total_likes,
        total_comments: day.total_comments,
        total_watch_time: day.total_watch_time,
        total_episodes: day.total_episodes,
        avg_engagement_rate: day.engagement_rates.length > 0 
          ? day.engagement_rates.reduce((a: number, b: number) => a + b, 0) / day.engagement_rates.length 
          : 0,
        top_podcasts: day.podcasts
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 5)
      }));

      setDailyStats(processedStats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  // Start manual sync
  const startManualSync = async () => {
    setSyncInProgress(true);
    try {
      const result = await startManualDataSyncAction(10);
      if (result.success) {
        toast.success('Manual sync started successfully!');
        // Start polling for status updates
        startStatusPolling();
      } else {
        toast.error(result.error || 'Failed to start manual sync');
      }
    } catch (error) {
      toast.error('Error starting manual sync');
    } finally {
      setSyncInProgress(false);
    }
  };

  // Save auto sync settings
  const saveAutoSyncSettings = async () => {
    try {
      const result = await saveAutoSyncSettingsAction(autoSyncSettings);
      if (result.success) {
        toast.success('Auto sync settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save auto sync settings');
      }
    } catch (error) {
      toast.error('Error saving auto sync settings');
    }
  };

  // Toggle auto sync
  const toggleAutoSync = async () => {
    const newSettings = { ...autoSyncSettings, enabled: !autoSyncSettings.enabled };
    setAutoSyncSettings(newSettings);
    
    try {
      const result = await saveAutoSyncSettingsAction(newSettings);
      if (result.success) {
        toast.success(`Auto sync ${newSettings.enabled ? 'enabled' : 'disabled'}`);
      } else {
        toast.error(result.error || 'Failed to update auto sync settings');
        // Revert on error
        setAutoSyncSettings(autoSyncSettings);
      }
    } catch (error) {
      toast.error('Error updating auto sync settings');
      setAutoSyncSettings(autoSyncSettings);
    }
  };

  // Start polling for status updates during sync
  const startStatusPolling = () => {
    const interval = setInterval(() => {
      fetchSyncStatus();
      if (!syncStatus.isRunning) {
        clearInterval(interval);
        fetchDailyStats(); // Refresh stats after sync
      }
    }, 2000); // Poll every 2 seconds

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSyncStatus(),
        fetchAutoSyncSettings(),
        fetchDailyStats()
      ]);
      setIsLoading(false);
    };

    loadData();

    // Set up periodic status updates
    const statusInterval = setInterval(fetchSyncStatus, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // Format time duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format watch time
  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sync data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Real-time Sync Status</span>
            {syncStatus.isRunning && (
              <Badge variant="default" className="animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Running
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Current sync status and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{syncStatus.currentProgress}%</span>
            </div>
            <Progress value={syncStatus.currentProgress} className="h-2" />
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.syncStats.totalPodcasts}</div>
              <div className="text-sm text-muted-foreground">Total Podcasts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStatus.syncStats.successfulPodcasts}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(syncStatus.syncStats.totalEpisodes)}</div>
              <div className="text-sm text-muted-foreground">Total Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(syncStatus.syncStats.successfulEpisodes)}</div>
              <div className="text-sm text-muted-foreground">Synced Episodes</div>
            </div>
          </div>

          {/* Last Sync Info */}
          {syncStatus.lastSyncTime && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}</span>
            </div>
          )}

          {/* Server Info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>Uptime: {formatDuration(syncStatus.serverUptime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Server: Online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Manual Data Sync</span>
          </CardTitle>
          <CardDescription>
            Trigger immediate data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={startManualSync} 
            disabled={syncInProgress || syncStatus.isRunning}
            className="w-full"
          >
            {syncInProgress || syncStatus.isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {syncStatus.isRunning ? 'Sync in Progress...' : 'Starting Sync...'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Manual Sync
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Auto Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Auto Sync Settings</span>
          </CardTitle>
          <CardDescription>
            Configure automatic data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoSyncSettings.enabled}
              onCheckedChange={toggleAutoSync}
            />
            <Label>Enable Auto Sync</Label>
          </div>

          {autoSyncSettings.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule_time">Sync Time</Label>
                  <Input
                    id="schedule_time"
                    type="time"
                    value={autoSyncSettings.schedule_time.substring(0, 5)}
                    onChange={(e) => setAutoSyncSettings({
                      ...autoSyncSettings,
                      schedule_time: e.target.value + ':00'
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch_size">Batch Size</Label>
                  <Input
                    id="batch_size"
                    type="number"
                    min="1"
                    max="50"
                    value={autoSyncSettings.batch_size}
                    onChange={(e) => setAutoSyncSettings({
                      ...autoSyncSettings,
                      batch_size: parseInt(e.target.value) || 10
                    })}
                  />
                </div>
              </div>
              <Button onClick={saveAutoSyncSettings} className="w-full">
                Save Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* YouTube Studio Style Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Daily Analytics - YouTube Studio Style</span>
          </CardTitle>
          <CardDescription>
            Day-wise performance data for all podcasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analytics data available yet.</p>
              <p className="text-sm">Run a sync to generate analytics data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dailyStats.map((day, index) => (
                <div key={day.date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <Badge variant="outline">
                      {day.total_episodes} episodes
                    </Badge>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-lg font-bold">{formatNumber(day.total_views)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-lg font-bold">{formatNumber(day.total_likes)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-lg font-bold">{formatNumber(day.total_comments)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Timer className="h-4 w-4 text-purple-500 mr-1" />
                        <span className="text-lg font-bold">{formatWatchTime(day.total_watch_time)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Watch Time</div>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Engagement Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(day.avg_engagement_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={day.avg_engagement_rate * 100} className="h-2" />
                  </div>

                  {/* Top Podcasts */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Performing Podcasts</h4>
                    <div className="space-y-2">
                      {day.top_podcasts.map((podcast, podcastIndex) => (
                        <div key={podcast.podcast_id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{podcast.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(podcast.views)} views • {formatNumber(podcast.likes)} likes • {formatNumber(podcast.comments)} comments
                            </div>
                          </div>
                          <Badge variant="secondary">#{podcastIndex + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}