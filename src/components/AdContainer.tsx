"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdContainerProps {
  pageName: string;
  placement: 'header' | 'sidebar' | 'content' | 'footer' | 'between_content';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  className?: string;
  children: React.ReactNode;
}

const AdContainer: React.FC<AdContainerProps> = ({
  pageName,
  placement,
  deviceType,
  className = '',
  children
}) => {
  const [hasAds, setHasAds] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForAds();
  }, [pageName, placement, deviceType]);

  const checkForAds = async () => {
    try {
      setLoading(true);
      
      // First check if there are any ads configured at all
      const { data: allAds, error: allAdsError } = await supabase
        .from('ad_configs')
        .select('id, pages, placement, status')
        .eq('status', 'active');

      if (allAdsError) throw allAdsError;

      // If no ads exist at all, don't show anything
      if (!allAds || allAds.length === 0) {
        setHasAds(false);
        return;
      }

      // Check if there are ads for this specific page and placement
      const adsForThisPage = allAds.filter(ad => {
        // Check if this page is in the ad's pages array or if it's set to 'all'
        const pageMatches = (ad as any).pages.includes(pageName) || (ad as any).pages.includes('all');
        // Check if placement matches
        const placementMatches = (ad as any).placement === placement;
        return pageMatches && placementMatches;
      });

      setHasAds(adsForThisPage.length > 0);
    } catch (error) {
      console.error('Error checking for ads:', error);
      setHasAds(false);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if loading or no ads
  if (loading || !hasAds) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default AdContainer;
