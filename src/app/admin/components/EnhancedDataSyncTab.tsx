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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Filter,
  Download
} from 'lucide-react';
import { 
  startManualDataSyncAction,
  saveAutoSyncSettingsAction,
  getAutoSyncSettingsAction
} from '@/app/actions/data-sync';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

interface PodcastAnalytics {
  id: string;
  title: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_watch_time: number;
  total_episodes: number;
  daily_views_gain: number;
  daily_likes_gain: number;
  daily_comments_gain: number;
  daily_watch_time_gain: number;
  new_episodes_count: number;
  last_updated: string;
  episodes: EpisodeAnalytics[];
}

interface EpisodeAnalytics {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  watch_time: number;
  daily_views_gain: number;
  daily_likes_gain: number;
  daily_comments_gain: number;
  daily_watch_time_gain: number;
  is_new_episode: boolean;
  published_at: string;
}

interface ChartData {
  date: string;
  views: number;
  views_gain: number;
  likes: number;
  likes_gain: number;
  comments: number;
  comments_gain: number;
  episodes: number;
}

export default function EnhancedDataSyncTab({ isPending, startTransition }: DataSyncTabProps) {
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

  const [podcasts, setPodcasts] = useState<PodcastAnalytics[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastAnalytics | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeAnalytics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [episodeChartData, setEpisodeChartData] = useState<ChartData[]>([]);
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [activeTab, setActiveTab] = useState<'overview' | 'podcast' | 'episode'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [syncMode, setSyncMode] = useState<'cpanel' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [syncControls, setSyncControls] = useState<{
    canResume: boolean;
    canPause: boolean;
    canCancel: boolean;
  }>({
    canResume: false,
    canPause: true,
    canCancel: true
  });

  // Fetch sync status from server
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
        setServerOnline(true);
        return data; // Return the status data
      } else {
        console.error('Server response not ok:', response.status, response.statusText);
        setServerOnline(false);
        setSyncStatus(prev => ({ ...prev, isRunning: false, currentStatus: 'idle' }));
        return null;
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
      setServerOnline(false);
      setSyncStatus(prev => ({ ...prev, isRunning: false, currentStatus: 'idle' }));
      return null;
    }
  };

  // Fetch all podcasts with analytics
  const fetchPodcasts = async () => {
    try {
      // Fetch from daily stats to get individual daily data (not cumulative)
      const { data: dailyStatsData, error: dailyStatsError } = await supabase
        .from('podcast_daily_stats')
              .select(`
        *,
        podcasts!inner(id, title, created_at, is_verified)
      `)
        .order('date', { ascending: false })
        .order('views', { ascending: false });

      if (dailyStatsError) {
        console.log('Daily stats table not available, fetching from podcasts table:', dailyStatsError.message);
        
        // Fallback to podcasts table
        const { data: podcastsData, error: podcastsError } = await supabase
          .from('podcasts')
          .select('id, title, created_at')
          .order('created_at', { ascending: false });

        if (podcastsError) {
          console.error('Error fetching podcasts:', podcastsError);
          return;
        }

        // Create mock analytics data
        const mockPodcasts = podcastsData.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_watch_time: 0,
          total_episodes: 0,
          daily_views_gain: 0,
          daily_likes_gain: 0,
          daily_comments_gain: 0,
          daily_watch_time_gain: 0,
          new_episodes_count: 0,
          last_updated: podcast.created_at,
          episodes: []
        }));

        setPodcasts(mockPodcasts);
        return;
      }

      // Group by podcast and get latest data only (no cumulative)
      const podcastMap = new Map();
      
      // Get only the latest data for each podcast (most recent date)
      const latestData = new Map();
      dailyStatsData.forEach((item: any) => {
        const podcastId = item.podcast_id;
        const itemDate = new Date(item.date);
        
        if (!latestData.has(podcastId) || itemDate > new Date(latestData.get(podcastId).date)) {
          latestData.set(podcastId, item);
        }
      });
      
      // Process only the latest data for each podcast
      latestData.forEach((item: any) => {
        const podcastId = item.podcast_id;
        
        podcastMap.set(podcastId, {
          id: podcastId,
          title: item.podcasts?.title || 'Unknown',
          is_verified: item.podcasts?.is_verified || false,
          total_views: item.views || 0, // Latest daily views
          total_likes: item.likes || 0, // Latest daily likes
          total_comments: item.comments || 0, // Latest daily comments
          total_watch_time: item.total_watch_time || 0, // Latest daily watch time
          total_episodes: item.total_episodes || 0, // Latest daily episodes
          daily_views_gain: 0, // Will be calculated separately
          daily_likes_gain: 0,
          daily_comments_gain: 0,
          daily_watch_time_gain: 0,
          new_episodes_count: item.new_episodes || 0,
          last_updated: item.updated_at,
          episodes: []
        });
      });

      // Now calculate daily gains for each podcast using API
      const podcastsWithGains = await Promise.all(
        Array.from(podcastMap.values()).map(async (podcast) => {
          try {
            const dailyGain = await calculateDailyGain(podcast.id);
            return {
              ...podcast,
              daily_views_gain: dailyGain.views,
              daily_likes_gain: dailyGain.likes,
              daily_comments_gain: dailyGain.comments,
              daily_watch_time_gain: dailyGain.watchTime
            };
          } catch (error) {
            console.error(`Error calculating daily gain for podcast ${podcast.id}:`, error);
            return {
              ...podcast,
              daily_views_gain: 0,
              daily_likes_gain: 0,
              daily_comments_gain: 0,
              daily_watch_time_gain: 0
            };
          }
        })
      );

      setPodcasts(podcastsWithGains);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    }
  };

  // Calculate daily gain for a specific podcast using API
  const calculateDailyGain = async (podcastId: string) => {
    try {
      const response = await fetch(`/api/rankings/daily-gain?podcastId=${podcastId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`Failed to fetch daily gain for podcast ${podcastId}:`, errorMessage);
        throw new Error(`Failed to fetch daily gain: ${errorMessage}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error calculating daily gain for podcast ${podcastId}:`, error);
      return { views: 0, likes: 0, comments: 0, watchTime: 0 };
    }
  };

  // Fetch episodes for selected podcast
  const fetchEpisodes = async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from('episode_daily_stats')
        .select(`
          *,
          episodes!inner(id, title, published_at)
        `)
        .eq('podcast_id', podcastId)
        .order('date', { ascending: false })
        .order('views', { ascending: false });

      if (error) {
        console.error('Error fetching episodes:', error);
        return [];
      }

      return data.map((item: any) => ({
        id: item.episode_id,
        title: item.episodes?.title || 'Unknown',
        views: item.views || 0, // Daily views (not cumulative)
        likes: item.likes || 0, // Daily likes (not cumulative)
        comments: item.comments || 0, // Daily comments (not cumulative)
        watch_time: item.watch_time || 0, // Daily watch time (not cumulative)
        daily_views_gain: item.views || 0, // Same as daily views
        daily_likes_gain: item.likes || 0, // Same as daily likes
        daily_comments_gain: item.comments || 0, // Same as daily comments
        daily_watch_time_gain: item.watch_time || 0, // Same as daily watch time
        is_new_episode: item.is_new_episode || false,
        published_at: item.episodes?.published_at || item.created_at
      }));
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return [];
    }
  };

  // Fetch chart data for selected podcast
  const fetchChartData = async (podcastId: string, filter: string) => {
    try {
      let dateFilter = '';
      switch (filter) {
        case 'weekly':
          dateFilter = `date >= '${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}'`;
          break;
        case 'monthly':
          dateFilter = `date >= '${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}'`;
          break;
        case 'all':
          // No date filter for all time
          break;
        default:
          dateFilter = `date >= '${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}'`;
      }

      let query = supabase
        .from('podcast_daily_stats')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('date', { ascending: true });

      // Apply date filter only if not 'all'
      if (filter !== 'all' && dateFilter) {
        query = query.gte('date', dateFilter.split("'")[1]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching chart data:', error);
        return [];
      }

      // Sort data by date to calculate daily gains properly
      const sortedData = data.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return sortedData.map((item: any, index: number) => {
        let viewsGain = 0;
        let likesGain = 0;
        let commentsGain = 0;
        
        if (index > 0) {
          const previousItem = sortedData[index - 1];
          viewsGain = Math.max(0, ((item as any).views || 0) - ((previousItem as any).views || 0));
          likesGain = Math.max(0, ((item as any).likes || 0) - ((previousItem as any).likes || 0));
          commentsGain = Math.max(0, ((item as any).comments || 0) - ((previousItem as any).comments || 0));
        }

        return {
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: item.views || 0, // Total views (cumulative)
          views_gain: viewsGain, // Actual daily increment
          likes: item.likes || 0, // Total likes (cumulative)
          likes_gain: likesGain,
          comments: item.comments || 0, // Total comments (cumulative)
          comments_gain: commentsGain,
          episodes: item.total_episodes || 0 // Total episodes (cumulative)
        };
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  };

  // Handle podcast selection
  const handlePodcastSelect = async (podcast: PodcastAnalytics) => {
    setSelectedPodcast(podcast);
    const episodes = await fetchEpisodes(podcast.id);
    setSelectedPodcast(prev => prev ? { ...prev, episodes } : null);
    
    const chartData = await fetchChartData(podcast.id, timeFilter);
    setChartData(chartData);
    
    // Auto switch to podcast tab
    setActiveTab('podcast');
  };

  // Handle episode selection
  const handleEpisodeSelect = async (episode: EpisodeAnalytics) => {
    setSelectedEpisode(episode);
    
    // Fetch episode chart data
    const episodeChartData = await fetchEpisodeChartData(episode.id, timeFilter);
    setEpisodeChartData(episodeChartData);
    
    // Auto switch to episode tab
    setActiveTab('episode');
  };

  // Fetch episode chart data
  const fetchEpisodeChartData = async (episodeId: string, filter: string) => {
    try {
      let dateFilter = '';
      switch (filter) {
        case 'weekly':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'monthly':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'all':
          // No date filter for all time
          break;
        default:
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      let query = supabase
        .from('episode_analytics_summary')
        .select('*')
        .eq('episode_id', episodeId)
        .order('date', { ascending: true });

      // Apply date filter only if not 'all'
      if (filter !== 'all' && dateFilter) {
        query = query.gte('date', dateFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching episode chart data:', error);
        return [];
      }

      // Sort data by date to calculate daily gains properly
      const sortedData = data.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return sortedData.map((item: any, index: number) => {
        let viewsGain = 0;
        let likesGain = 0;
        let commentsGain = 0;
        
        if (index > 0) {
          const previousItem = sortedData[index - 1];
          viewsGain = Math.max(0, ((item as any).views || 0) - ((previousItem as any).views || 0));
          likesGain = Math.max(0, ((item as any).likes || 0) - ((previousItem as any).likes || 0));
          commentsGain = Math.max(0, ((item as any).comments || 0) - ((previousItem as any).comments || 0));
        }

        return {
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: item.views || 0,
          views_gain: viewsGain, // Actual daily increment
          likes: item.likes || 0,
          likes_gain: likesGain,
          comments: item.comments || 0,
          comments_gain: commentsGain,
          episodes: 1
        };
      });
    } catch (error) {
      console.error('Error fetching episode chart data:', error);
      return [];
    }
  };

  // Start manual sync
  const startManualSync = async () => {
    setSyncInProgress(true);
    try {
      const result = await startManualDataSyncAction(10);
      if (result.success) {
        toast.success('Manual sync started successfully!');
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

  // Pause sync
  const pauseSync = async () => {
    try {
      const response = await fetch('/api/sync-pause', { method: 'POST' });
      if (response.ok) {
        toast.success('Sync paused successfully!');
        setSyncControls(prev => ({ ...prev, canPause: false, canResume: true }));
      } else {
        toast.error('Failed to pause sync');
      }
    } catch (error) {
      toast.error('Error pausing sync');
    }
  };

  // Resume sync
  const resumeSync = async () => {
    try {
      const response = await fetch('/api/sync-resume', { method: 'POST' });
      if (response.ok) {
        toast.success('Sync resumed successfully!');
        setSyncControls(prev => ({ ...prev, canResume: false, canPause: true }));
      } else {
        toast.error('Failed to resume sync');
      }
    } catch (error) {
      toast.error('Error resuming sync');
    }
  };

  // Cancel sync
  const cancelSync = async () => {
    try {
      const response = await fetch('/api/sync-cancel', { method: 'POST' });
      if (response.ok) {
        toast.success('Sync cancelled successfully!');
        setSyncControls({ canResume: false, canPause: false, canCancel: false });
      } else {
        toast.error('Failed to cancel sync');
      }
    } catch (error) {
      toast.error('Error cancelling sync');
    }
  };

  // Start polling for status updates during sync
  const startStatusPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync-status');
        const currentStatus = await response.json();
        
        if (currentStatus && !currentStatus.isRunning) {
          clearInterval(interval);
          await fetchPodcasts(); // Refresh data after sync
          await fetchSyncHistory(); // Refresh sync history
        }
      } catch (error) {
        console.error('Error polling sync status:', error);
      }
    }, 2000);
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  // Load auto sync settings
  const loadAutoSyncSettings = async () => {
    try {
      const result = await getAutoSyncSettingsAction();
      if (result.success && 'data' in result && result.data) {
        setAutoSyncSettings({
          ...result.data,
          schedule_type: result.data.schedule_type as 'daily' | 'weekly' | 'monthly'
        });
      }
    } catch (error) {
      console.error('Error loading auto sync settings:', error);
    }
  };

  // Save auto sync settings
  const saveSettings = async () => {
    try {
      const result = await saveAutoSyncSettingsAction({
        ...autoSyncSettings,
        syncMode: syncMode
      });
      if (result.success) {
        toast.success('Sync settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving sync settings');
    }
  };

  // Fetch sync history
  const fetchSyncHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching sync history:', error);
        return;
      }

      setSyncHistory(data || []);
    } catch (error) {
      console.error('Error fetching sync history:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSyncStatus(),
        fetchPodcasts(),
        loadAutoSyncSettings(),
        fetchSyncHistory()
      ]);
      setIsLoading(false);
    };

    loadData();
    const statusInterval = setInterval(fetchSyncStatus, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  // Update batch size when sync mode changes
  useEffect(() => {
    setAutoSyncSettings(prev => ({
      ...prev,
      batch_size: syncMode === 'local' ? 100 : 10
    }));
  }, [syncMode]);

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };



  // Format duration for server uptime
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
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
            <Badge variant={serverOnline ? "default" : "destructive"}>
              {serverOnline ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Server Online
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Server Offline
                </>
              )}
            </Badge>
            {syncStatus.isRunning && (
              <Badge variant="default" className="animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Running
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{syncStatus.currentProgress}%</span>
            </div>
            <Progress value={syncStatus.currentProgress} className="h-2" />
          </div>

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

          {/* Server Information */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Server Time:</span>
              <span className="font-medium">
                {syncStatus.serverTime ? new Date(syncStatus.serverTime).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">
                {formatDuration(syncStatus.serverUptime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-medium">
                {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <Badge 
              variant={syncStatus.isRunning ? "default" : syncStatus.currentStatus === 'completed' ? "secondary" : "outline"}
              className="text-sm"
            >
              {syncStatus.isRunning ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Sync Running
                </>
              ) : syncStatus.currentStatus === 'completed' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sync Completed
                </>
              ) : syncStatus.currentStatus === 'failed' ? (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Sync Failed
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Idle
                </>
              )}
            </Badge>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={startManualSync} 
            disabled={syncInProgress || syncStatus.isRunning || !serverOnline}
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

          {/* Sync Controls */}
          {syncStatus.isRunning && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={pauseSync}
                disabled={!syncControls.canPause}
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                variant="outline" 
                onClick={resumeSync}
                disabled={!syncControls.canResume}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button 
                variant="destructive" 
                onClick={cancelSync}
                disabled={!syncControls.canCancel}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sync Settings</span>
          </CardTitle>
          <CardDescription>
            Configure sync mode and automatic synchronization schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sync Mode */}
          <div className="space-y-2">
            <Label htmlFor="sync-mode">Sync Mode</Label>
            <Select value={syncMode} onValueChange={(value: 'cpanel' | 'local') => setSyncMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Mode (High Performance)</SelectItem>
                <SelectItem value="cpanel">cPanel Mode (Optimized)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {syncMode === 'local' 
                ? 'Ultra High Performance Mode: Uses full system resources (32GB RAM, Fast SSD, 8-core CPU) for maximum speed and throughput'
                : 'Optimized for shared hosting with limited resources'
              }
            </p>
          </div>

          <Separator />

          {/* Auto Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auto Sync Configuration</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync-enabled"
                checked={autoSyncSettings.enabled}
                onCheckedChange={(checked) => 
                  setAutoSyncSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label htmlFor="auto-sync-enabled">Enable Auto Sync</Label>
            </div>

            {autoSyncSettings.enabled && (
              <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select
                    value={autoSyncSettings.schedule_type}
                    onValueChange={(value: any) => 
                      setAutoSyncSettings(prev => ({ ...prev, schedule_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Schedule Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={autoSyncSettings.schedule_time || '02:00'}
                    onChange={(e) => 
                      setAutoSyncSettings(prev => ({ ...prev, schedule_time: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-retries">Max Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    min="1"
                    max="10"
                    value={autoSyncSettings.max_retries || 3}
                    onChange={(e) => 
                      setAutoSyncSettings(prev => ({ ...prev, max_retries: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min="1"
                    max={syncMode === 'local' ? 500 : 50}
                    value={autoSyncSettings.batch_size || (syncMode === 'local' ? 100 : 10)}
                    onChange={(e) => 
                      setAutoSyncSettings(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {syncMode === 'local' 
                      ? 'Ultra High Performance: 1-500 (recommended: 100-200 for 32GB RAM + 8-core CPU)'
                      : 'Optimized mode: 1-50 (recommended: 10)'
                    }
                  </p>
                </div>
              </div>

              <Button onClick={saveSettings} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Sync Settings
              </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Sync History</span>
              </CardTitle>
              <CardDescription>
                Recent sync sessions and their status
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSyncHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sync history</h3>
              <p className="text-muted-foreground">
                Sync history will appear here after running data sync.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncHistory.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {session.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : session.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {session.session_type === 'manual' ? 'Manual Sync' : 'Auto Sync'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {session.successful_podcasts || 0}/{session.total_podcasts || 0} podcasts
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.successful_episodes || 0} episodes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* YouTube Studio Style Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Podcast Analytics - YouTube Studio Style</span>
          </CardTitle>
          <CardDescription>
            Comprehensive analytics for all podcasts with individual episode tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="podcast" disabled={!selectedPodcast}>Podcast Details</TabsTrigger>
              <TabsTrigger value="episode" disabled={!selectedEpisode}>Episode Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {podcasts.map((podcast, index) => (
                  <Card key={`${podcast.id}-${index}`} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePodcastSelect(podcast)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{podcast.title}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Eye className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-lg font-bold">{formatNumber(podcast.total_views)}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">Total Views</div>
                              {podcast.daily_views_gain > 0 && (
                                <div className="text-xs text-green-600 flex items-center justify-center">
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  +{formatNumber(podcast.daily_views_gain)}
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Heart className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-lg font-bold">{formatNumber(podcast.total_likes)}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">Total Likes</div>
                              {podcast.daily_likes_gain > 0 && (
                                <div className="text-xs text-green-600 flex items-center justify-center">
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  +{formatNumber(podcast.daily_likes_gain)}
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <MessageCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-lg font-bold">{formatNumber(podcast.total_comments)}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">Total Comments</div>
                              {podcast.daily_comments_gain > 0 && (
                                <div className="text-xs text-green-600 flex items-center justify-center">
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  +{formatNumber(podcast.daily_comments_gain)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{podcast.total_episodes} episodes</span>
                            {podcast.new_episodes_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{podcast.new_episodes_count} new
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="podcast" className="space-y-4">
              {selectedPodcast && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{selectedPodcast.title}</h2>
                    <div className="flex space-x-2">
                      <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      {timeFilter === 'monthly' && (
                        <Input
                          type="month"
                          value={selectedMonth || ''}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-40"
                        />
                      )}
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Views</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Daily Views Gain</CardTitle>
                          <div className="flex items-center space-x-2">
                            <select 
                              value={timeFilter} 
                              onChange={(e) => {
                                setTimeFilter(e.target.value as 'weekly' | 'monthly' | 'all');
                                if (selectedPodcast) {
                                  fetchChartData(selectedPodcast.id, e.target.value).then(setChartData);
                                }
                              }}
                              className="px-3 py-1 border rounded-md text-sm"
                            >
                              <option value="weekly">This Week</option>
                              <option value="monthly">This Month</option>
                              <option value="all">All Time</option>
                            </select>
                          </div>
                        </div>
                        {chartData.length > 0 && (
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                              <span>
                                {timeFilter === 'weekly' ? 'Week Total' : 
                                 timeFilter === 'monthly' ? 'Month Total' : 'All Time Total'}: 
                                <span className="font-semibold text-green-600 ml-1">
                                  {formatNumber(chartData.reduce((sum, item) => sum + (item.views_gain || 0), 0))}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                formatNumber(Number(value)), 
                                name === 'views_gain' ? 'Daily Gain' : name
                              ]}
                            />
                            <Bar dataKey="views_gain" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Daily Likes Gain</CardTitle>
                          <div className="flex items-center space-x-2">
                            <select 
                              value={timeFilter} 
                              onChange={(e) => {
                                setTimeFilter(e.target.value as 'weekly' | 'monthly' | 'all');
                                if (selectedPodcast) {
                                  fetchChartData(selectedPodcast.id, e.target.value).then(setChartData);
                                }
                              }}
                              className="px-3 py-1 border rounded-md text-sm"
                            >
                              <option value="weekly">This Week</option>
                              <option value="monthly">This Month</option>
                              <option value="all">All Time</option>
                            </select>
                          </div>
                        </div>
                        {chartData.length > 0 && (
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                              <span>
                                {timeFilter === 'weekly' ? 'Week Total' : 
                                 timeFilter === 'monthly' ? 'Month Total' : 'All Time Total'}: 
                                <span className="font-semibold text-red-600 ml-1">
                                  {formatNumber(chartData.reduce((sum, item) => sum + (item.likes_gain || 0), 0))}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                formatNumber(Number(value)), 
                                name === 'likes_gain' ? 'Daily Gain' : name
                              ]}
                            />
                            <Bar dataKey="likes_gain" fill="#ff6b6b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Daily Comments Gain</CardTitle>
                          <div className="flex items-center space-x-2">
                            <select 
                              value={timeFilter} 
                              onChange={(e) => {
                                setTimeFilter(e.target.value as 'weekly' | 'monthly' | 'all');
                                if (selectedPodcast) {
                                  fetchChartData(selectedPodcast.id, e.target.value).then(setChartData);
                                }
                              }}
                              className="px-3 py-1 border rounded-md text-sm"
                            >
                              <option value="weekly">This Week</option>
                              <option value="monthly">This Month</option>
                              <option value="all">All Time</option>
                            </select>
                          </div>
                        </div>
                        {chartData.length > 0 && (
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                              <span>
                                {timeFilter === 'weekly' ? 'Week Total' : 
                                 timeFilter === 'monthly' ? 'Month Total' : 'All Time Total'}: 
                                <span className="font-semibold text-blue-600 ml-1">
                                  {formatNumber(chartData.reduce((sum, item) => sum + (item.comments_gain || 0), 0))}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                formatNumber(Number(value)), 
                                name === 'comments_gain' ? 'Daily Gain' : name
                              ]}
                            />
                            <Bar dataKey="comments_gain" fill="#4ecdc4" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Episodes List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Episodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPodcast.episodes.map((episode, index) => (
                          <div key={`${episode.id}-${index}`} 
                               className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted"
                               onClick={() => handleEpisodeSelect(episode)}>
                            <div className="flex-1">
                              <h4 className="font-medium">{episode.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {formatNumber(episode.views)}
                                  {episode.daily_views_gain > 0 && (
                                    <span className="text-green-600 ml-1">(+{formatNumber(episode.daily_views_gain)})</span>
                                  )}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {formatNumber(episode.likes)}
                                  {episode.daily_likes_gain > 0 && (
                                    <span className="text-green-600 ml-1">(+{formatNumber(episode.daily_likes_gain)})</span>
                                  )}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {formatNumber(episode.comments)}
                                  {episode.daily_comments_gain > 0 && (
                                    <span className="text-green-600 ml-1">(+{formatNumber(episode.daily_comments_gain)})</span>
                                  )}
                                </span>
                                {episode.is_new_episode && (
                                  <Badge variant="secondary" className="text-xs">New</Badge>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="episode" className="space-y-4">
              {selectedEpisode && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{selectedEpisode.title}</h2>
                    <div className="flex space-x-2">
                      <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      {timeFilter === 'monthly' && (
                        <Input
                          type="month"
                          value={selectedMonth || ''}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-40"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(selectedEpisode.views)}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                        {selectedEpisode.daily_views_gain > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            +{formatNumber(selectedEpisode.daily_views_gain)} today
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{formatNumber(selectedEpisode.likes)}</div>
                        <div className="text-sm text-muted-foreground">Total Likes</div>
                        {selectedEpisode.daily_likes_gain > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            +{formatNumber(selectedEpisode.daily_likes_gain)} today
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{formatNumber(selectedEpisode.comments)}</div>
                        <div className="text-sm text-muted-foreground">Total Comments</div>
                        {selectedEpisode.daily_comments_gain > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            +{formatNumber(selectedEpisode.daily_comments_gain)} today
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Episode Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Views</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={episodeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Daily Views Gain</CardTitle>
                          <div className="flex items-center space-x-2">
                            <select 
                              value={timeFilter} 
                              onChange={(e) => {
                                setTimeFilter(e.target.value as 'weekly' | 'monthly' | 'all');
                                if (selectedEpisode) {
                                  fetchEpisodeChartData(selectedEpisode.id, e.target.value).then(setEpisodeChartData);
                                }
                              }}
                              className="px-3 py-1 border rounded-md text-sm"
                            >
                              <option value="weekly">This Week</option>
                              <option value="monthly">This Month</option>
                              <option value="all">All Time</option>
                            </select>
                          </div>
                        </div>
                        {episodeChartData.length > 0 && (
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                              <span>
                                {timeFilter === 'weekly' ? 'Week Total' : 
                                 timeFilter === 'monthly' ? 'Month Total' : 'All Time Total'}: 
                                <span className="font-semibold text-green-600 ml-1">
                                  {formatNumber(episodeChartData.reduce((sum, item) => sum + (item.views_gain || 0), 0))}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={episodeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                formatNumber(Number(value)), 
                                name === 'views_gain' ? 'Daily Gain' : name
                              ]}
                            />
                            <Bar dataKey="views_gain" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
