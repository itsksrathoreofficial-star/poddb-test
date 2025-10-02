"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { ContentAd, FooterAd, BetweenContentAd } from './AdDisplay';

interface AdPlacementProps {
  placement: 'content' | 'footer' | 'between_content';
  className?: string;
  maxAds?: number;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ 
  placement, 
  className = '', 
  maxAds = 1 
}) => {
  const pathname = usePathname();
  const [hasAds, setHasAds] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine page name based on pathname
  const getPageName = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/podcasts')) return 'podcasts';
    if (path.startsWith('/episodes')) return 'episodes';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/people')) return 'people';
    if (path.startsWith('/locations')) return 'locations';
    if (path.startsWith('/languages')) return 'languages';
    if (path.startsWith('/rankings')) return 'rankings';
    if (path.startsWith('/awards')) return 'awards';
    if (path.startsWith('/news')) return 'news';
    if (path.startsWith('/explore')) return 'explore';
    if (path.startsWith('/contribute')) return 'contribute';
    if (path.startsWith('/contribution-history')) return 'contribution-history';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/preview')) return 'preview';
    if (path.startsWith('/admin-preview')) return 'admin-preview';
    if (path.startsWith('/privacy')) return 'privacy';
    if (path.startsWith('/terms')) return 'terms';
    if (path.startsWith('/help')) return 'help';
    if (path.startsWith('/maintenance')) return 'maintenance';
    return 'all';
  };

  // Check if current page should show ads (exclude admin pages)
  const shouldShowAds = (path: string): boolean => {
    // Don't show ads on admin pages
    if (path.startsWith('/admin')) return false;
    // Don't show ads on auth pages
    if (path.startsWith('/auth')) return false;
    // Don't show ads on API routes
    if (path.startsWith('/api')) return false;
    return true;
  };

  const pageName = getPageName(pathname);

  // Check if there are ads for this placement
  useEffect(() => {
    const checkForAds = async () => {
      if (!shouldShowAds(pathname)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get active ads for this specific placement and page
        const { data: ads, error } = await supabase
          .from('ad_configs')
          .select('id')
          .eq('status', 'active')
          .eq('placement', placement)
          .or(`pages.cs.{${pageName}},pages.cs.{all}` as any);

        if (error) throw error;

        setHasAds((ads?.length || 0) > 0);
      } catch (error) {
        console.error('Error checking for ads:', error);
        setHasAds(false);
      } finally {
        setLoading(false);
      }
    };

    checkForAds();
  }, [pathname, pageName, placement]);

  // Don't show anything if loading, no ads, or shouldn't show ads
  if (loading || !hasAds || !shouldShowAds(pathname)) {
    return null;
  }

  // Render the appropriate ad component
  switch (placement) {
    case 'content':
      return <ContentAd pageName={pageName} className={className} maxAds={maxAds} />;
    case 'footer':
      return <FooterAd pageName={pageName} className={className} maxAds={maxAds} />;
    case 'between_content':
      return <BetweenContentAd pageName={pageName} className={className} maxAds={maxAds} />;
    default:
      return null;
  }
};

export default AdPlacement;
