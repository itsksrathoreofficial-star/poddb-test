"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

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
      
      {/* Load custom JS */}
      {ad.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: ad.custom_js }} />
      )}
    </div>
  );
};

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

interface AdDisplayProps {
  placement: 'header' | 'sidebar' | 'content' | 'footer' | 'between_content';
  pageName: string;
  className?: string;
  maxAds?: number;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ 
  placement, 
  pageName, 
  className = '', 
  maxAds = 3 
}) => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const { user } = useAuth();

  useEffect(() => {
    // Detect device type
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };

    setDeviceType(detectDevice());
    
    // Listen for resize events
    const handleResize = () => {
      setDeviceType(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (deviceType) {
      fetchAds();
    }
  }, [deviceType, pageName, placement]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      
      // First check if there are any active ads at all
      const { data: allAds, error: allAdsError } = await supabase
        .from('ad_configs')
        .select('*')
        .eq('status', 'active');

      if (allAdsError) throw allAdsError;

      // If no ads exist at all, don't show anything
      if (!allAds || allAds.length === 0) {
        setAds([]);
        return;
      }

      // Filter ads for this specific page and placement
      const filteredAds = allAds.filter(ad => {
        // Check if this page is in the ad's pages array or if it's set to 'all'
        const pageMatches = (ad as any).pages.includes(pageName) || (ad as any).pages.includes('all');
        // Check if placement matches
        const placementMatches = (ad as any).placement === placement;
        // Check if device matches
        const deviceMatches = (ad as any).devices.includes(deviceType);
        return pageMatches && placementMatches && deviceMatches;
      }).slice(0, maxAds);

      setAds(filteredAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      // If there's an error, don't show any ads
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const recordImpression = async (adId: string) => {
    try {
      await supabase.rpc('record_ad_impression', {
        p_ad_id: adId,
        p_user_id: user?.id || null,
        p_ip_address: null, // Will be handled by server
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
        p_user_id: user?.id || null,
        p_ip_address: null, // Will be handled by server
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer,
        p_page_url: window.location.href
      } as any);

      // Open click URL if provided
      if (clickUrl) {
        window.open(clickUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  const renderGoogleAdSense = (ad: AdConfig) => {
    return (
      <GoogleAdSenseAd 
        key={ad.id}
        ad={ad}
        onImpression={recordImpression}
      />
    );
  };

  const renderCustomAd = (ad: AdConfig) => {
    return (
      <CustomAd 
        key={ad.id}
        ad={ad}
        onImpression={recordImpression}
        onClick={recordClick}
      />
    );
  };

  if (loading) {
    return null; // Don't show loading placeholder
  }

  if (ads.length === 0) {
    return null; // Don't show anything if no ads
  }

  return (
    <div className={`ad-display ${className}`}>
      {ads.map((ad) => (
        <div key={ad.id} className="ad-wrapper mb-4">
          {ad.type === 'google_adsense' ? renderGoogleAdSense(ad) : renderCustomAd(ad)}
        </div>
      ))}
    </div>
  );
};

// Specific placement components for easier use
export const HeaderAd: React.FC<{ pageName: string; className?: string }> = ({ pageName, className }) => (
  <AdDisplay placement="header" pageName={pageName} className={className} maxAds={1} />
);

export const SidebarAd: React.FC<{ pageName: string; className?: string; maxAds?: number }> = ({ 
  pageName, 
  className, 
  maxAds = 2 
}) => (
  <AdDisplay placement="sidebar" pageName={pageName} className={className} maxAds={maxAds} />
);

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
