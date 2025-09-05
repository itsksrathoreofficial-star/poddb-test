"use client";
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Track page view when pathname or search params change
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    analytics.trackPageView(url, document.title);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Track clicks on interactive elements
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        const className = typeof target.className === 'string' ? target.className : '';
        const id = target.id || '';
        const text = target.textContent?.trim().substring(0, 50) || '';
        
        // Track clicks on buttons, links, and other interactive elements
        if (tagName === 'button' || tagName === 'a' || target.onclick || target.getAttribute('role') === 'button') {
          const firstClass = className && typeof className === 'string' ? className.split(' ')[0] : '';
          analytics.trackClick(`${tagName}${id ? `#${id}` : ''}${firstClass ? `.${firstClass}` : ''}`, undefined, {
            text,
            tagName,
            className,
            id,
            pathname
          });
        }
      }
    };

    // Track form submissions
    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (form) {
        analytics.trackEvent('form_submit', 'form', 'submit', form.action || 'unknown', undefined, {
          action: form.action,
          method: form.method,
          pathname,
        });
      }
    };

    // Track search queries
    const handleSearch = (event: Event) => {
      const searchInput = event.target as HTMLInputElement;
      if (searchInput && searchInput.type === 'search') {
        const query = searchInput.value.trim();
        if (query) {
          analytics.trackSearch(query, undefined, {
            pathname,
            inputId: searchInput.id,
            inputName: searchInput.name,
          });
        }
      }
    };

    // Track file downloads
    const handleDownload = (event: Event) => {
      const link = event.target as HTMLAnchorElement;
      if (link && link.href && (link.download || link.href.includes('.pdf') || link.href.includes('.doc'))) {
        analytics.trackEvent('download', 'file', 'download', link.href, undefined, {
          filename: link.download || link.href.split('/').pop(),
          pathname,
        });
      }
    };

    // Track video/audio plays
    const handleMediaPlay = (event: Event) => {
      const media = event.target as HTMLMediaElement;
      if (media) {
        analytics.trackEvent('play', 'media', 'play', media.src || 'unknown', undefined, {
          mediaType: media.tagName.toLowerCase(),
          src: media.src,
          pathname,
        });
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('input', handleSearch);
    document.addEventListener('click', handleDownload);
    document.addEventListener('play', handleMediaPlay);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      document.removeEventListener('input', handleSearch);
      document.removeEventListener('click', handleDownload);
      document.removeEventListener('play', handleMediaPlay);
    };
  }, [pathname]);

  // Track user engagement metrics
  useEffect(() => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    let startTime = Date.now();
    let isActive = true;

    const trackEngagement = () => {
      if (isActive) {
        const timeSpent = (Date.now() - startTime) / 1000;
        if (timeSpent > 30) { // Track every 30 seconds
          analytics.trackEvent('page_view', 'user', 'time_spent', undefined, Math.floor(timeSpent), {
            pathname,
            timeSpent: Math.floor(timeSpent),
          });
          startTime = Date.now();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
        const timeSpent = (Date.now() - startTime) / 1000;
        if (timeSpent > 10) { // Only track if user spent more than 10 seconds
          analytics.trackEvent('page_view', 'user', 'page_leave', undefined, Math.floor(timeSpent), {
            pathname,
            timeSpent: Math.floor(timeSpent),
          });
        }
      } else {
        isActive = true;
        startTime = Date.now();
      }
    };

    const interval = setInterval(trackEngagement, 30000); // Check every 30 seconds
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
