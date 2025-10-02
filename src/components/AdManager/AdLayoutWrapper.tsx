"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { ContentAd, FooterAd, BetweenContentAd } from './AdDisplay';

interface AdLayoutWrapperProps {
  children: React.ReactNode;
  showHeaderAd?: boolean;
  showSidebarAd?: boolean;
  showContentAd?: boolean;
  showFooterAd?: boolean;
  showBetweenContentAd?: boolean;
  sidebarPosition?: 'left' | 'right';
  className?: string;
}

interface AdCheck {
  hasContentAds: boolean;
  hasFooterAds: boolean;
  hasBetweenContentAds: boolean;
}

const AdLayoutWrapper: React.FC<AdLayoutWrapperProps> = ({
  children,
  showHeaderAd = true,
  showSidebarAd = true,
  showContentAd = true,
  showFooterAd = true,
  showBetweenContentAd = true,
  sidebarPosition = 'right',
  className = ''
}) => {
  const pathname = usePathname();
  const [adCheck, setAdCheck] = useState<AdCheck>({
    hasContentAds: false,
    hasFooterAds: false,
    hasBetweenContentAds: false
  });
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

  // Check which ad placements have active ads for this page
  useEffect(() => {
    const checkForAds = async () => {
      if (!shouldShowAds(pathname)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get all active ads for this page
        const { data: allAds, error } = await supabase
          .from('ad_configs')
          .select('placement, pages')
          .eq('status', 'active');

        if (error) throw error;

        // Debug logging
        console.log('🔍 AdLayoutWrapper Debug:', {
          pathname,
          pageName,
          totalAds: allAds?.length || 0,
          ads: allAds?.map((ad: any) => ({ placement: (ad as any).placement, pages: (ad as any).pages }))
        });

        // Check which placements have ads for this page
        const hasAds = {
          hasContentAds: false,
          hasFooterAds: false,
          hasBetweenContentAds: false
        };

        allAds?.forEach((ad: any) => {
          const pageMatches = (ad.pages as any).includes(pageName) || (ad.pages as any).includes('all');
          if (pageMatches) {
            switch ((ad as any).placement) {
              case 'content':
                hasAds.hasContentAds = true;
                break;
              case 'footer':
                hasAds.hasFooterAds = true;
                break;
              case 'between_content':
                hasAds.hasBetweenContentAds = true;
                break;
            }
          }
        });

        console.log('🔍 Ad Check Result:', hasAds);
        setAdCheck(hasAds);
      } catch (error) {
        console.error('Error checking for ads:', error);
      } finally {
        setLoading(false);
      }
    };

    checkForAds();
  }, [pathname, pageName]);

  // If ads shouldn't be shown on this page, just return children
  if (!shouldShowAds(pathname)) {
    return <>{children}</>;
  }

  // If loading, just return children
  if (loading) {
    return <>{children}</>;
  }

  // If no ads are configured for any placement, just return children without any wrapper
  if (!adCheck.hasContentAds && !adCheck.hasFooterAds && !adCheck.hasBetweenContentAds) {
    return <>{children}</>;
  }

  return (
    <div className={`ad-layout-wrapper ${className}`}>
      {/* Main Content */}
      <main className="w-full">
        {/* Content Ad at top - only show if there are content ads */}
        {showContentAd && adCheck.hasContentAds && (
          <div className="content-ad-top mb-6">
            <ContentAd pageName={pageName} className="w-full" maxAds={1} />
          </div>
        )}

        {/* Between Content Ad - only show if there are between content ads */}
        {showBetweenContentAd && adCheck.hasBetweenContentAds && (
          <div className="between-content-ad mb-6">
            <BetweenContentAd pageName={pageName} className="w-full" maxAds={1} />
          </div>
        )}

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>

        {/* Content Ad at bottom - only show if there are content ads */}
        {showContentAd && adCheck.hasContentAds && (
          <div className="content-ad-bottom mt-6">
            <ContentAd pageName={pageName} className="w-full" maxAds={1} />
          </div>
        )}
      </main>

      {/* Footer Ad - only show if there are footer ads */}
      {showFooterAd && adCheck.hasFooterAds && (
        <div className="footer-ad-container mt-8">
          <FooterAd pageName={pageName} className="w-full" maxAds={1} />
        </div>
      )}
    </div>
  );
};

export default AdLayoutWrapper;
