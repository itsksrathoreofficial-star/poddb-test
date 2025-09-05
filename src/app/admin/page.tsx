"use client";
import React, { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, Podcast, FileText, Newspaper, Users, UserCheck, Key, Cpu, Settings, Trophy, Vote, MessageSquare, BarChart3, RefreshCw, MapPin, Mail, Eye, AlertTriangle, Square } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Json, Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { exportSettingsAction, getContributionsAction } from '@/app/actions/admin';

// Temporary fix for missing Supabase types
const OverviewTab = dynamic(() => import('./components/OverviewTab'), { loading: () => <Loader2 className="animate-spin" /> });
const ContentManagementTab = dynamic(() => import('./components/ContentManagementTab'), { loading: () => <Loader2 className="animate-spin" /> });
const PagesTab = dynamic(() => import('./components/PagesTab'), { loading: () => <Loader2 className="animate-spin" /> });

const UsersTab = dynamic(() => import('./components/UsersTab'), { loading: () => <Loader2 className="animate-spin" /> });

const AwardsTab = dynamic(() => import('./components/AwardsTab'), { loading: () => <Loader2 className="animate-spin" /> });



const AiSeoTab = dynamic(() => import('./components/AiSeoTab'), { loading: () => <Loader2 className="animate-spin" /> });
const AnalyticsTab = dynamic(() => import('./components/AnalyticsTab'), { loading: () => <Loader2 className="animate-spin" /> });


const SettingsTab = dynamic(() => import('./components/SettingsTab'), { loading: () => <Loader2 className="animate-spin" /> });
const DataSyncTab = dynamic(() => import('./components/EnhancedDataSyncTab'), { loading: () => <Loader2 className="animate-spin" /> });
const SyncServerManager = dynamic(() => import('./components/SyncServerManager'), { loading: () => <Loader2 className="animate-spin" /> });

const EmailManagementTab = dynamic(() => import('./components/EmailManagementTab'), { loading: () => <Loader2 className="animate-spin" /> });
const PreviewUpdatesTab = dynamic(() => import('./components/PreviewUpdatesTab'), { loading: () => <Loader2 className="animate-spin" /> });
// const ErrorTrackingTab = dynamic(() => import('./components/ErrorTrackingTab'), { loading: () => <Loader2 className="animate-spin" /> }); // Temporarily disabled
const AdManagerTab = dynamic(() => import('@/components/AdManager/AdManager'), { loading: () => <Loader2 className="animate-spin" /> });


type NewsArticle = Tables<'news_articles'> & { profiles: { display_name: string } | null };

const adminTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'podcasts', label: 'Content Management', icon: Podcast },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'preview_updates', label: 'Preview Updates', icon: Eye },
    { id: 'error_tracking', label: 'Error Tracking', icon: AlertTriangle },
    { id: 'ad_manager', label: 'Ad Manager', icon: Square },
    { id: 'ai_seo', label: 'AI SEO', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'data_sync', label: 'Data Sync', icon: RefreshCw },
    { id: 'sync_server', label: 'Sync Server', icon: Cpu },
    { id: 'email', label: 'Email Management', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('overview');
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  // Data states for child components
  const [allPodcasts, setAllPodcasts] = useState<any[]>([]);
  const [pendingPodcasts, setPendingPodcasts] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [geminiApiKeys, setGeminiApiKeys] = useState<any[]>([]);
  const [openRouterApiKeys, setOpenRouterApiKeys] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [seoJobStats, setSeoJobStats] = useState({ pending: 0, completed: 0, failed: 0 });
  const [settings, setSettings] = useState<any>(null);
  const [carouselItems, setCarouselItems] = useState<Tables<'explore_carousel'>[]>([]);
  const [pagesContent, setPagesContent] = useState<{ about: Json }>({ about: {} });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to fetch user profile");
    } finally {
      setProfileLoading(false);
    }
  };
  
  useEffect(() => {
    if (!profileLoading && profile && profile.role === 'admin') {
      fetchAllData();
    }
  }, [profileLoading, profile]);

  const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch critical data first
        await Promise.all([
          fetchAllPodcasts(),
          fetchPendingPodcasts(),
          fetchUsers(),
          fetchSettings()
        ]);
        
        // Fetch secondary data in background
        Promise.all([
          fetchContributions(),
          fetchApiKeys(),
          fetchGeminiApiKeys(),
          fetchOpenRouterApiKeys(),
          fetchSeoJobStats(),
          fetchNewsArticles(),
          fetchVerificationRequests(),
          fetchCarouselItems(),
          fetchPagesContent()
        ]).catch(error => {
          console.error('Error fetching secondary data:', error);
        });
      } catch (error) {
        console.error('Error fetching critical data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
  };
  
  const fetchAllPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, youtube_playlist_id, submission_status, total_episodes, total_views, last_episode_date, description, seo_metadata, slug, categories, tags')
        .order('title', { ascending: true });
      if (error) throw error;
      setAllPodcasts(data || []);
    } catch (error: any) {
      toast.error(`Error fetching all podcasts: ${error.message}`);
    }
  };

  const fetchPendingPodcasts = async () => {
    try {
      // Fetch pending podcasts using the original, working RPC
      const { data: podcasts, error: podcastError } = await supabase.rpc('get_pending_podcasts_with_profiles');
      if (podcastError) throw podcastError;

      // Fetch pending contributions using the secure server action
      const contributionsResult = await getContributionsAction();
      if (!contributionsResult.success) throw new Error(contributionsResult.error);
      const contributions = (contributionsResult.data as any)?.filter((c: any) => c.status === 'pending') || [];

      // Manually fetch profile data for each contribution
      const formattedContributions = await Promise.all(contributions.map(async (c: any) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('user_id', c.user_id)
          .single();

        if (profileError) {
          console.error(`Failed to fetch profile for contribution ${c.id}:`, profileError);
        }

        return {
          id: c.id,
          title: (c.data as any).title || `Update for ${c.target_table}`,
          display_name: (profileData as any)?.display_name || 'N/A',
          email: (profileData as any)?.email || 'N/A',
          type: 'update',
          target_table: c.target_table,
          target_id: c.target_id,
        };
      }));

      // Combine the two lists
      setPendingPodcasts([...(podcasts || []), ...formattedContributions]);
    } catch (error: any) {
      toast.error(`Failed to fetch pending submissions: ${error.message}`);
    }
  };

  const fetchContributions = async () => {
    try {
      const result = await getContributionsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      setContributions(result.data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch contributions: ${error.message}`);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
    }
  };
  
  const fetchNewsArticles = async () => {
      try {
          const { data, error } = await supabase
              .from('news_articles')
              .select('*')
              .order('created_at', { ascending: false });
          if (error) throw error;
          setNewsArticles(data as any || []);
      } catch (error: any) {
          toast.error(`Failed to fetch news articles: ${error.message}`);
      }
  };

  const fetchVerificationRequests = async () => {
      try {
          const { data, error } = await supabase.rpc('get_all_verification_requests');
          if (error) throw error;
          setVerificationRequests(data || []);
      } catch (error: any) {
          toast.error(`Failed to fetch verification requests: ${error.message}`);
      }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch API keys");
    }
  };

  const fetchGeminiApiKeys = async () => {
        try {
            const { data, error } = await supabase
                .from('gemini_api_keys')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setGeminiApiKeys(data || []);
        } catch (error: any) {
            toast.error(`Failed to fetch Gemini API keys: ${error.message}`);
        }
    };

  const fetchOpenRouterApiKeys = async () => {
        try {
            const { data, error } = await supabase
                .from('openrouter_api_keys')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setOpenRouterApiKeys(data || []);
        } catch (error: any) {
            toast.error(`Failed to fetch OpenRouter API keys: ${error.message}`);
        }
    };
  
  const fetchSeoJobStats = async () => {
      try {
          const { data, error } = await supabase.rpc('get_seo_job_stats');
          if (error) throw error;
          setSeoJobStats(data[0] || { pending: 0, completed: 0, failed: 0 });
      } catch (error: any) {
          toast.error(`Failed to fetch SEO job stats: ${error.message}`);
      }
  };

  const fetchSettings = async () => {
    try {
      const result = await exportSettingsAction();
      if (result.success) {
        setSettings(result.data || { maintenance_mode: false });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Failed to fetch settings: ${error.message}`);
      setSettings({ maintenance_mode: false }); // Default value on error
    }
  };

  const fetchCarouselItems = async () => {
    try {
        const { data, error } = await supabase.from('explore_carousel').select('*').order('order', { ascending: true });
        if (error) throw error;
        setCarouselItems(data || []);
    } catch (error: any) {
        toast.error(`Failed to fetch carousel items: ${error.message}`);
    }
  };

  // DEV. NOTE: The 'pages' table requires SELECT permissions for the 'authenticated'
  // role in Supabase. If you're encountering permission errors, ensure the following
  // SQL has been executed:
  //
  // -- Grant select access to the 'authenticated' role on the 'pages' table
  // GRANT SELECT ON TABLE public.pages TO authenticated;
  //
  // This is necessary because the data is fetched client-side, and RLS policies apply.
  const fetchPagesContent = async () => {
    try {
        const { data, error } = await supabase.from('pages').select('slug, content').in('slug', ['about']);
        if (error) throw error;
        const contentMap = (data || []).reduce((acc: { [key: string]: Json }, page: { slug: string | null, content: Json | null }) => {
            if (page.slug) {
                acc[page.slug] = page.content;
            }
            return acc;
        }, {});
        setPagesContent({ about: contentMap.about || {} });
    } catch (error: any) {
        toast.error(`Failed to fetch page content: ${error.message}`);
    }
  }


  // Redirect if not admin
  useEffect(() => {
    if (!user || (!profileLoading && (!profile || profile.role !== 'admin'))) {
      if (typeof window !== 'undefined') {
        router.replace('/');
      }
    }
  }, [user, profileLoading, profile, router]);

  if (!user || (!profileLoading && (!profile || profile.role !== 'admin'))) {
    return null;
  }
  
  if (loading || profileLoading) {
    return <div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTabLoading(prev => ({ ...prev, [tabId]: true }));
    
    // Simulate loading for better UX
    setTimeout(() => {
      setTabLoading(prev => ({ ...prev, [tabId]: false }));
    }, 300);
  };

  const commonProps = {
    isPending,
    startTransition
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab
                    allPodcasts={allPodcasts}
                    pendingPodcasts={pendingPodcasts}
                    users={users}
                    verificationRequests={verificationRequests}
                    {...commonProps}
                    fetchPendingPodcasts={fetchPendingPodcasts}
                    fetchAllPodcasts={fetchAllPodcasts}
                    fetchVerificationRequests={fetchVerificationRequests}
                    user={user}
                />;
      case 'podcasts':
        return <ContentManagementTab allPodcasts={allPodcasts} fetchAllPodcasts={fetchAllPodcasts} />;
      case 'pages':
        return <PagesTab
                    carouselItems={carouselItems}
                    pagesContent={pagesContent}
                    fetchCarouselItems={fetchCarouselItems}
                    fetchPagesContent={fetchPagesContent}
                    newsArticles={newsArticles}
                    fetchNewsArticles={fetchNewsArticles}
                    user={profile}
                    {...commonProps}
                />;
      case 'users':
        return <UsersTab users={users} fetchUsers={fetchUsers} />;
      case 'awards':
        return <AwardsTab user={user} />;
      case 'preview_updates':
        return <PreviewUpdatesTab />;
      case 'error_tracking':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Error Tracking</h2><p className="text-muted-foreground">Error tracking is temporarily disabled due to TypeScript compatibility issues.</p></div>;
      case 'ad_manager':
        return <AdManagerTab />;
      case 'ai_seo':
        return <AiSeoTab seoJobStats={seoJobStats} fetchSeoJobStats={fetchSeoJobStats} fetchAllPodcasts={fetchAllPodcasts} {...commonProps} />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'data_sync':
        return <DataSyncTab {...commonProps} />;
      case 'sync_server':
        return <SyncServerManager />;
      case 'email':
        return <EmailManagementTab users={users} {...commonProps} />;
      case 'settings':
        return <SettingsTab 
                    settings={settings} 
                    fetchSettings={fetchSettings} 
                    apiKeys={apiKeys}
                    geminiApiKeys={geminiApiKeys}
                    openRouterApiKeys={openRouterApiKeys}
                    refetchApiKeys={fetchApiKeys}
                    refetchGeminiApiKeys={fetchGeminiApiKeys}
                    refetchOpenRouterApiKeys={fetchOpenRouterApiKeys}
                    {...commonProps} 
                />;
      default:
        return null;
    }
  };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 lg:w-1/5">
          <nav className="flex flex-col space-y-2">
            {adminTabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                className={cn(
                    "w-full justify-start",
                    activeTab === tab.id && "font-bold"
                )}
                onClick={() => handleTabChange(tab.id)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          {tabLoading[activeTab] ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading {adminTabs.find(tab => tab.id === activeTab)?.label}...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
