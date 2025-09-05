import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Enable analytics with silent error handling
const ANALYTICS_ENABLED = true;
const SILENT_MODE = true; // Hide all analytics errors

export interface AnalyticsEvent {
  session_id: string;
  user_id?: string;
  event_type: 'page_view' | 'click' | 'search' | 'download' | 'play' | 'pause' | 'complete' | 'share' | 'form_submit' | 'conversion';
  page_url: string;
  page_title?: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  screen_resolution?: string;
  language?: string;
  timezone?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsSession {
  id: string;
  user_id?: string;
  session_start: Date;
  session_end?: Date;
  duration_seconds?: number;
  page_views_count?: number;
  clicks_count?: number;
  searches_count?: number;
  downloads_count?: number;
  plays_count?: number;
  country_code?: string;
  region?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  screen_resolution?: string;
  language?: string;
  timezone?: string;
  referrer_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  is_bounce?: boolean;
  exit_page?: string;
  metadata?: Record<string, any>;
}

export interface PagePerformance {
  page_url: string;
  page_title?: string;
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avg_time_on_page: number;
  bounce_rate: number;
  exit_rate: number;
  unique_visitors: number;
  total_visits: number;
  organic_traffic: number;
  direct_traffic: number;
  referral_traffic: number;
  social_traffic: number;
  paid_traffic: number;
}

export interface KeywordPerformance {
  keyword: string;
  date: string;
  search_volume: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avg_position: number;
  avg_cpc: number;
  competition_level?: string;
  search_intent?: string;
  related_pages?: string[];
}

export interface TrafficSource {
  source_domain: string;
  source_type: 'organic' | 'direct' | 'referral' | 'social' | 'paid';
  date: string;
  sessions: number;
  users: number;
  page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface UserDemographics {
  date: string;
  age_group: string;
  gender?: string;
  country_code?: string;
  region?: string;
  city?: string;
  sessions: number;
  users: number;
  page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface SEOPerformance {
  page_url: string;
  date: string;
  google_indexed: boolean;
  google_position?: number;
  google_impressions: number;
  google_clicks: number;
  google_ctr: number;
  bing_indexed: boolean;
  bing_position?: number;
  bing_impressions: number;
  bing_clicks: number;
  bing_ctr: number;
  page_speed_score?: number;
  mobile_friendly?: boolean;
  core_web_vitals?: {
    lcp?: number;
    fid?: number;
    cls?: number;
  };
  seo_score?: number;
}

export interface ConversionEvent {
  session_id: string;
  user_id?: string;
  conversion_type: string;
  conversion_value?: number;
  page_url?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, any>;
}

export interface CustomEvent {
  id?: string;
  session_id: string;
  user_id?: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  page_url?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string = '';
  private sessionStartTime: Date = new Date();
  private currentPage: string = '';
  private pageStartTime: Date = new Date();
  private lastEventTime: number = 0;
  private eventThrottleMs: number = 1000; // 1 second throttle

  constructor() {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = new Date();
    this.initializeSession();
    this.setupPageVisibilityListener();
    this.setupBeforeUnloadListener();
  }

  private getOrCreateSessionId(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return uuidv4();
    }
    
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async initializeSession(): Promise<void> {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Skip if analytics is disabled
    if (!ANALYTICS_ENABLED) {
      return;
    }
    
    try {
      const urlParams = typeof window !== 'undefined' && typeof URLSearchParams !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const utmParams = {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
      };

      const sessionData: Partial<AnalyticsSession> = {
        id: this.sessionId,
        session_start: this.sessionStartTime,
        referrer_domain: typeof document !== 'undefined' && document.referrer && typeof URL !== 'undefined' ? new URL(document.referrer).hostname : undefined,
        ...utmParams,
        country_code: undefined, // Will be updated later if available
        device_type: this.getDeviceType(),
        browser: this.getBrowserInfo().name,
        browser_version: this.getBrowserInfo().version,
        os: this.getOSInfo().name,
        os_version: this.getOSInfo().version,
        screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown',
      };

      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        try {
          // Check if session already exists
          const { data: existingSession, error: selectError } = await supabase
            .from('analytics_sessions')
            .select('id')
            .eq('id', this.sessionId)
            .single();

          // If no existing session and no error, insert new session
          if (!existingSession && !selectError) {
            const { error: insertError } = await supabase
              .from('analytics_sessions')
              .insert(sessionData as any);
            
            if (insertError) {
              // Silently ignore insert errors (table might not exist or permissions issue)
              return;
            }
          }
        } catch (error) {
          // Silently ignore all analytics session errors
          return;
        }
      }

    } catch (error) {
      // Silently ignore all analytics initialization errors
      return;
    }
  }

  private async getCountryCode(): Promise<string | undefined> {
    // Disabled for now to prevent fetch errors
    // Country code is not critical for analytics functionality
    return undefined;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof navigator === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|phone|android|iphone|ipod|blackberry|opera mini|windows phone/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowserInfo(): { name: string; version: string } {
    if (typeof navigator === 'undefined') return { name: 'Unknown', version: 'Unknown' };
    
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    return { name: browserName, version: browserVersion };
  }

  private getOSInfo(): { name: string; version: string } {
    if (typeof navigator === 'undefined') return { name: 'Unknown', version: 'Unknown' };
    
    const userAgent = navigator.userAgent;
    let osName = 'Unknown';
    let osVersion = 'Unknown';

    if (userAgent.includes('Windows')) {
      osName = 'Windows';
      osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Mac')) {
      osName = 'macOS';
      osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux';
      osVersion = 'Unknown';
    } else if (userAgent.includes('Android')) {
      osName = 'Android';
      osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('iOS')) {
      osName = 'iOS';
      osVersion = userAgent.match(/OS (\d+\.\d+)/)?.[1] || 'Unknown';
    }

    return { name: osName, version: osVersion };
  }

  private setupPageVisibilityListener(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endPageView();
      } else {
        // Resume tracking when page becomes visible
        this.pageStartTime = new Date();
      }
    });
  }

  private setupBeforeUnloadListener(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeunload', () => {
      this.endPageView();
      this.endSession();
    });
  }

  public async trackPageView(url: string, title?: string): Promise<void> {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Skip if analytics is disabled
    if (!ANALYTICS_ENABLED) return;
    
    if (this.currentPage === url) return;

    this.endPageView();
    this.currentPage = url;
    this.pageStartTime = new Date();

    try {
      const eventData: AnalyticsEvent = {
        session_id: this.sessionId,
        event_type: 'page_view',
        page_url: url,
        page_title: title || (typeof document !== 'undefined' ? document.title : 'unknown'),
        referrer_url: typeof document !== 'undefined' ? document.referrer : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        device_type: this.getDeviceType(),
        browser: this.getBrowserInfo().name,
        browser_version: this.getBrowserInfo().version,
        os: this.getOSInfo().name,
        os_version: this.getOSInfo().version,
        screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown',
      };

      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        try {
          // Add unique constraint to prevent duplicates
          const uniqueEventData = {
            ...eventData,
            id: uuidv4() // Generate new UUID for each event
          };
          
          // Use upsert to handle conflicts gracefully
          await supabase
            .from('analytics_events')
            .upsert(uniqueEventData as any, { 
              onConflict: 'id',
              ignoreDuplicates: true 
            });
        } catch (error) {
          // Silently ignore 409 conflicts (duplicate data) - this is expected
          if (error && typeof error === 'object' && 'code' in error && error.code === '409') {
            // This is expected - duplicate event, ignore silently
            return;
          }
          // Silent mode - don't log any analytics errors
          if (SILENT_MODE) {
            return;
          }
          console.warn('Analytics events table not available:', error);
        }
      }

    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  public async trackEvent(
    eventType: AnalyticsEvent['event_type'],
    category?: string,
    action?: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Throttle events to prevent spam
    const now = Date.now();
    if (now - this.lastEventTime < this.eventThrottleMs) {
      return;
    }
    this.lastEventTime = now;
    
    // Skip if analytics is disabled
    if (!ANALYTICS_ENABLED) return;
    
    try {
      const eventData: AnalyticsEvent = {
        session_id: this.sessionId,
        event_type: eventType,
        page_url: this.currentPage,
        page_title: typeof document !== 'undefined' ? document.title : 'unknown',
        metadata: {
          category,
          action,
          label,
          value,
          ...metadata,
        },
      };

      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        try {
          // Add unique constraint to prevent duplicates
          const uniqueEventData = {
            ...eventData,
            id: uuidv4() // Generate new UUID for each event
          };
          
          // Use upsert to handle conflicts gracefully
          await supabase
            .from('analytics_events')
            .upsert(uniqueEventData as any, { 
              onConflict: 'id',
              ignoreDuplicates: true 
            });

          // Track as custom event if category and action are provided
          if (category && action) {
            const customEventData: CustomEvent = {
              id: uuidv4(), // Generate new UUID for custom event
              session_id: this.sessionId,
              event_category: category,
              event_action: action,
              event_label: label,
              event_value: value,
              page_url: this.currentPage,
              metadata,
            };

            try {
              // Use upsert to handle conflicts gracefully
              await supabase
                .from('analytics_custom_events')
                .upsert(customEventData as any, { 
                  onConflict: 'id',
                  ignoreDuplicates: true 
                });
            } catch (error) {
              // Silent mode - don't log any analytics errors
              if (SILENT_MODE) {
                return;
              }
              // Silently ignore 409 conflicts (duplicate data)
              if (error && typeof error === 'object' && 'code' in error && error.code === '409') {
                // This is expected - duplicate event, ignore silently
                return;
              }
              console.warn('Analytics custom events table not available:', error);
            }
          }
        } catch (error) {
          // Silently ignore 409 conflicts (duplicate data) - this is expected
          if (error && typeof error === 'object' && 'code' in error && error.code === '409') {
            // This is expected - duplicate event, ignore silently
            return;
          }
          // Silent mode - don't log any analytics errors
          if (SILENT_MODE) {
            return;
          }
          console.warn('Analytics events table not available:', error);
        }
      }

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  public async trackClick(
    element: string,
    pageUrl?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('click', 'user_interaction', 'click', element, undefined, {
      element,
      page_url: pageUrl || this.currentPage,
      ...metadata,
    });
  }

  public async trackSearch(
    query: string,
    resultsCount?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('search', 'search', 'query', query, resultsCount, {
      query,
      results_count: resultsCount,
      ...metadata,
    });
  }

  public async trackConversion(
    conversionType: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const conversionData: ConversionEvent = {
        session_id: this.sessionId,
        conversion_type: conversionType,
        conversion_value: value,
        page_url: this.currentPage,
        referrer_url: typeof document !== 'undefined' ? document.referrer : undefined,
        metadata,
      };

      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        await supabase
          .from('analytics_conversions')
          .insert(conversionData as any);
      }

    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  private endPageView(): void {
    if (!this.currentPage || !this.pageStartTime) return;

    const timeOnPage = (Date.now() - this.pageStartTime.getTime()) / 1000;
    
    // Update page performance metrics
    this.updatePagePerformance(this.currentPage, timeOnPage);
  }

  private async updatePagePerformance(pageUrl: string, timeOnPage: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        await supabase.rpc('update_analytics_page_performance', {
          p_page_url: pageUrl,
          p_date: today,
          p_time_on_page: timeOnPage,
        } as any);
      }

    } catch (error) {
      console.error('Error updating page performance:', error);
    }
  }

  private async endSession(): Promise<void> {
    try {
      const sessionEndTime = new Date();
      const durationSeconds = Math.floor(
        (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / 1000
      );

      // Check if supabase is available
      if (typeof supabase !== 'undefined') {
        await supabase
          .from('analytics_sessions')
          .update({
            session_end: sessionEndTime,
            duration_seconds: durationSeconds,
          } as any)
          .eq('id', this.sessionId);

        // Calculate final session metrics
        await supabase.rpc('calculate_session_metrics', {
          session_uuid: this.sessionId,
        } as any);
      }

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Analytics data retrieval methods for admin dashboard
  public async getPagePerformance(
    startDate: string,
    endDate: string,
    pageUrl?: string
  ): Promise<PagePerformance[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      let query = supabase
        .from('analytics_page_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (pageUrl) {
        query = query.eq('page_url', pageUrl);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Analytics page performance table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching page performance:', error);
      return [];
    }
  }

  public async getKeywordPerformance(
    startDate: string,
    endDate: string,
    keyword?: string
  ): Promise<KeywordPerformance[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      let query = supabase
        .from('analytics_keywords')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (keyword) {
        query = query.eq('keyword', keyword);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Analytics keywords table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching keyword performance:', error);
      return [];
    }
  }

  public async getTrafficSources(
    startDate: string,
    endDate: string
  ): Promise<TrafficSource[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('analytics_traffic_sources')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Analytics traffic sources table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching traffic sources:', error);
      return [];
    }
  }

  public async getUserDemographics(
    startDate: string,
    endDate: string
  ): Promise<UserDemographics[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('analytics_user_demographics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Analytics user demographics table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching user demographics:', error);
      return [];
    }
  }

  public async getSEOPerformance(
    startDate: string,
    endDate: string,
    pageUrl?: string
  ): Promise<SEOPerformance[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      let query = supabase
        .from('analytics_seo_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (pageUrl) {
        query = query.eq('page_url', pageUrl);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Analytics SEO performance table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching SEO performance:', error);
      return [];
    }
  }

  public async getConversionEvents(
    startDate: string,
    endDate: string,
    conversionType?: string
  ): Promise<any[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      let query = supabase
        .from('analytics_conversions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (conversionType) {
        query = query.eq('conversion_type', conversionType);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Analytics conversions table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching conversion events:', error);
      return [];
    }
  }

  public async getCustomEvents(
    startDate: string,
    endDate: string,
    category?: string
  ): Promise<CustomEvent[]> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return [];
      }
      
      let query = supabase
        .from('analytics_custom_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('event_category', category);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Analytics custom events table not available:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching custom events:', error);
      return [];
    }
  }

  public async getDashboardSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    totalSessions: number;
    totalPageViews: number;
    totalUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: any[];
    topTrafficSources: any[];
    topKeywords: any[];
  }> {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        return {
          totalSessions: 0,
          totalPageViews: 0,
          totalUsers: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          topTrafficSources: [],
          topKeywords: [],
        };
      }
      
      // Get total sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('session_start', startDate)
        .lte('session_start', endDate);

      if (sessionsError) {
        console.warn('Analytics sessions table not available:', sessionsError);
        return {
          totalSessions: 0,
          totalPageViews: 0,
          totalUsers: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          topTrafficSources: [],
          topKeywords: [],
        };
      }

      // Get total page views
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (pageViewsError) {
        console.warn('Analytics events table not available:', pageViewsError);
        return {
          totalSessions: sessions?.length || 0,
          totalPageViews: 0,
          totalUsers: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          topTrafficSources: [],
          topKeywords: [],
        };
      }

      // Get top pages
      const { data: topPages, error: topPagesError } = await supabase
        .from('analytics_page_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('impressions', { ascending: false })
        .limit(10);

      if (topPagesError) {
        console.warn('Analytics page performance table not available:', topPagesError);
      }

      // Get top traffic sources
      const { data: topTrafficSources, error: topTrafficSourcesError } = await supabase
        .from('analytics_traffic_sources')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('sessions', { ascending: false })
        .limit(10);

      if (topTrafficSourcesError) {
        console.warn('Analytics traffic sources table not available:', topTrafficSourcesError);
      }

      // Get top keywords
      const { data: topKeywords, error: topKeywordsError } = await supabase
        .from('analytics_keywords')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('impressions', { ascending: false })
        .limit(10);

      if (topKeywordsError) {
        console.warn('Analytics keywords table not available:', topKeywordsError);
      }

      const totalSessions = sessions?.length || 0;
      const totalPageViews = pageViews?.length || 0;
      const totalUsers = new Set(sessions?.map((s: any) => s.user_id).filter(Boolean)).size;
      
      const avgSessionDuration = sessions?.length 
        ? sessions.reduce((acc, s) => acc + ((s as any).duration_seconds || 0), 0) / sessions.length
        : 0;

      const bounceRate = sessions?.length
        ? (sessions.filter((s: any) => s.is_bounce).length / sessions.length) * 100
        : 0;

      return {
        totalSessions,
        totalPageViews,
        totalUsers,
        avgSessionDuration,
        bounceRate,
        topPages: topPages || [],
        topTrafficSources: topTrafficSources || [],
        topKeywords: topKeywords || [],
      };

    } catch (error) {
      console.warn('Error fetching dashboard summary:', error);
      return {
        totalSessions: 0,
        totalPageViews: 0,
        totalUsers: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        topTrafficSources: [],
        topKeywords: [],
      };
    }
  }
}

// Create a singleton instance
export const analytics = new AnalyticsService();

// Export the class for testing purposes
export { AnalyticsService };
