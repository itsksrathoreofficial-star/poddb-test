"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdConfig {
  id: string;
  name: string;
  type: 'google_adsense' | 'custom';
  placement: string;
  ad_position: number;
  google_adsense_code?: string;
  custom_html?: string;
  custom_css?: string;
  click_url?: string;
  image_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  priority: number;
}

interface AdDisplayProps {
  placement: 'content' | 'footer' | 'between_content';
  pageName: string;
  className?: string;
  maxAds?: number;
}

// Google AdSense Ad Component
const GoogleAdSenseAd: React.FC<{
  ad: AdConfig;
  onImpression: (adId: string) => void;
}> = ({ ad, onImpression }) => {
  useEffect(() => {
    // Record impression when component mounts
    onImpression(ad.id);

    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      document.head.appendChild(script);
    }

    // Push ad to AdSense queue
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error pushing AdSense ad:', error);
      }
    }
  }, [ad.id, onImpression]);

  return (
    <div 
      className="ad-container"
      style={{ 
        width: ad.width ? `${ad.width}px` : '100%',
        height: ad.height ? `${ad.height}px` : 'auto',
        maxWidth: '100%'
      }}
      dangerouslySetInnerHTML={{ __html: ad.google_adsense_code || '' }}
    />
  );
};

// Custom Ad Component
const CustomAd: React.FC<{
  ad: AdConfig;
  onImpression: (adId: string) => void;
  onClick: (adId: string, clickUrl?: string) => void;
}> = ({ ad, onImpression, onClick }) => {
  useEffect(() => {
    // Record impression when component mounts
    onImpression(ad.id);
  }, [ad.id, onImpression]);

  const handleClick = () => {
    onClick(ad.id, ad.click_url);
  };

  return (
    <div 
      className="custom-ad-container"
      style={{ 
        width: ad.width ? `${ad.width}px` : '100%',
        height: ad.height ? `${ad.height}px` : 'auto',
        maxWidth: '100%',
        cursor: ad.click_url ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      {ad.image_url ? (
        <img 
          src={ad.image_url} 
          alt={ad.alt_text || ad.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '4px'
          }}
        />
      ) : (
        <div 
          dangerouslySetInnerHTML={{ __html: ad.custom_html || '' }}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />
      )}
      
      {/* Load custom CSS */}
      {ad.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: ad.custom_css }} />
      )}
    </div>
  );
};

const AdDisplay: React.FC<AdDisplayProps> = ({ 
  placement, 
  pageName, 
  className = '', 
  maxAds = 3 
}) => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [pageName, placement]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      
      // Get all active ads
      const { data: allAds, error } = await supabase
        .from('ad_configs')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      // Filter ads for this specific page and placement
      const filteredAds = allAds?.filter(ad => {
        // Check if this page is in the ad's pages array or if it's set to 'all'
        const pageMatches = (ad as any).pages.includes(pageName) || (ad as any).pages.includes('all');
        // Check if placement matches
        const placementMatches = (ad as any).placement === placement;
        return pageMatches && placementMatches;
      }).slice(0, maxAds) || [];

      setAds(filteredAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const recordImpression = async (adId: string) => {
    try {
      await supabase.rpc('record_ad_impression', {
        p_ad_id: adId,
        p_user_id: null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_page_url: window.location.href
      } as any);
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const recordClick = async (adId: string, clickUrl?: string) => {
    try {
      await supabase.rpc('record_ad_click', {
        p_ad_id: adId,
        p_user_id: null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer,
        p_page_url: window.location.href
      } as any);

      if (clickUrl) {
        window.open(clickUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  // Don't show anything if loading or no ads
  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`ad-display ${className}`}>
      {ads.map((ad) => (
        <div key={ad.id} className="ad-wrapper mb-4">
          {ad.type === 'google_adsense' ? (
            <GoogleAdSenseAd 
              ad={ad} 
              onImpression={recordImpression} 
            />
          ) : (
            <CustomAd 
              ad={ad} 
              onImpression={recordImpression}
              onClick={recordClick}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Specific placement components
export const ContentAd: React.FC<{ pageName: string; className?: string; maxAds?: number }> = ({ 
  pageName, 
  className, 
  maxAds = 1 
}) => (
  <AdDisplay placement="content" pageName={pageName} className={className} maxAds={maxAds} />
);

export const FooterAd: React.FC<{ pageName: string; className?: string; maxAds?: number }> = ({ 
  pageName, 
  className, 
  maxAds = 1 
}) => (
  <AdDisplay placement="footer" pageName={pageName} className={className} maxAds={maxAds} />
);

export const BetweenContentAd: React.FC<{ pageName: string; className?: string; maxAds?: number }> = ({ 
  pageName, 
  className, 
  maxAds = 1 
}) => (
  <AdDisplay placement="between_content" pageName={pageName} className={className} maxAds={maxAds} />
);

export default AdDisplay;
