"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { HeaderAd, SidebarAd, ContentAd, FooterAd, BetweenContentAd } from './AdDisplay';
import AdContainer from './AdContainer';

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
  const showAdsOnThisPage = shouldShowAds(pathname);

  // If ads shouldn't be shown on this page, just return children
  if (!showAdsOnThisPage) {
    return <>{children}</>;
  }

  // Detect device type
  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const deviceType = getDeviceType();

  return (
    <div className={`ad-layout-wrapper ${className}`}>
      {/* Header Ad - Only show if there are ads configured for this page */}
      {showHeaderAd && (
        <AdContainer
          pageName={pageName}
          placement="header"
          deviceType={deviceType}
          className="header-ad-container"
        >
          <HeaderAd pageName={pageName} className="w-full" />
        </AdContainer>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Ad - Only show if there are ads configured for this page */}
        {showSidebarAd && sidebarPosition === 'left' && (
          <AdContainer
            pageName={pageName}
            placement="sidebar"
            deviceType={deviceType}
            className="lg:w-1/4 xl:w-1/5"
          >
            <aside>
              <div className="sticky top-4">
                <SidebarAd pageName={pageName} className="w-full" maxAds={2} />
              </div>
            </aside>
          </AdContainer>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Content Ad at top - Only show if there are ads configured for this page */}
          {showContentAd && (
            <AdContainer
              pageName={pageName}
              placement="content"
              deviceType={deviceType}
              className="content-ad-top mb-6"
            >
              <ContentAd pageName={pageName} className="w-full" maxAds={1} />
            </AdContainer>
          )}

          {/* Between Content Ad - Only show if there are ads configured for this page */}
          {showBetweenContentAd && (
            <AdContainer
              pageName={pageName}
              placement="between_content"
              deviceType={deviceType}
              className="between-content-ad mb-6"
            >
              <BetweenContentAd pageName={pageName} className="w-full" maxAds={1} />
            </AdContainer>
          )}

          {/* Page Content */}
          <div className="page-content">
            {children}
          </div>

          {/* Content Ad at bottom - Only show if there are ads configured for this page */}
          {showContentAd && (
            <AdContainer
              pageName={pageName}
              placement="content"
              deviceType={deviceType}
              className="content-ad-bottom mt-6"
            >
              <ContentAd pageName={pageName} className="w-full" maxAds={1} />
            </AdContainer>
          )}
        </main>

        {/* Right Sidebar Ad - Only show if there are ads configured for this page */}
        {showSidebarAd && sidebarPosition === 'right' && (
          <AdContainer
            pageName={pageName}
            placement="sidebar"
            deviceType={deviceType}
            className="lg:w-1/4 xl:w-1/5"
          >
            <aside>
              <div className="sticky top-4">
                <SidebarAd pageName={pageName} className="w-full" maxAds={2} />
              </div>
            </aside>
          </AdContainer>
        )}
      </div>

      {/* Footer Ad - Only show if there are ads configured for this page */}
      {showFooterAd && (
        <AdContainer
          pageName={pageName}
          placement="footer"
          deviceType={deviceType}
          className="footer-ad-container mt-8"
        >
          <FooterAd pageName={pageName} className="w-full" maxAds={1} />
        </AdContainer>
      )}
    </div>
  );
};

// Specific layout components for different page types
export const HomePageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={true}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={true}
    sidebarPosition="right"
  >
    {children}
  </AdLayoutWrapper>
);

export const PodcastPageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={true}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={false}
    sidebarPosition="right"
  >
    {children}
  </AdLayoutWrapper>
);

export const EpisodePageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={true}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={true}
    sidebarPosition="right"
  >
    {children}
  </AdLayoutWrapper>
);

export const SearchPageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={true}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={false}
    sidebarPosition="right"
  >
    {children}
  </AdLayoutWrapper>
);

export const CategoryPageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={true}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={false}
    sidebarPosition="right"
  >
    {children}
  </AdLayoutWrapper>
);

export const StaticPageAdLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdLayoutWrapper
    showHeaderAd={true}
    showSidebarAd={false}
    showContentAd={true}
    showFooterAd={true}
    showBetweenContentAd={false}
  >
    {children}
  </AdLayoutWrapper>
);

export default AdLayoutWrapper;
