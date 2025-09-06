"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface AdConfig {
  id: string;
  name: string;
  type: 'google_adsense' | 'custom';
  placement: string;
  ad_position: number;
  google_adsense_code?: string;
  custom_html?: string;
  custom_css?: string;
  custom_js?: string;
  click_url?: string;
  image_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  priority: number;
}

interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

export const useAds = (pageName: string, deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop') => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ads/track?page=${pageName}&device=${deviceType}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setAds(result.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [pageName, deviceType, fetchAds]);

  const trackImpression = async (adId: string) => {
    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'impression',
          adId,
          userId: user?.id,
          pageUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId: string, clickUrl?: string) => {
    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'click',
          adId,
          userId: user?.id,
          pageUrl: window.location.href,
          referrer: document.referrer,
        }),
      });

      if (clickUrl) {
        window.open(clickUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const getAdsByPlacement = (placement: string) => {
    return ads.filter(ad => ad.placement === placement);
  };

  const getAdStats = async (adId: string): Promise<AdStats | null> => {
    try {
      const response = await fetch(`/api/ads/stats?adId=${adId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching ad stats:', error);
      return null;
    }
  };

  return {
    ads,
    loading,
    error,
    trackImpression,
    trackClick,
    getAdsByPlacement,
    getAdStats,
    refetch: fetchAds
  };
};

export const useAdStats = (adId: string) => {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ads/stats?adId=${adId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setStats(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching ad stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [adId, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
