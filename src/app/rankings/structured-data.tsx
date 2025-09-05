'use client';

import { useEffect } from 'react';
import { generateSEOData, SEOConfig } from '@/lib/seo-generator';

interface StructuredDataProps {
  config: SEOConfig;
}

export default function StructuredData({ config }: StructuredDataProps) {
  useEffect(() => {
    const addStructuredData = async () => {
      try {
        const seoData = await generateSEOData(config);
        
        // Remove existing structured data
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
          if (script.textContent?.includes('ItemList') || 
              script.textContent?.includes('BreadcrumbList') ||
              script.textContent?.includes('WebSite')) {
            script.remove();
          }
        });
        
        // Add new structured data
        seoData.structuredData.forEach((data: any) => {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify(data);
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Error adding structured data:', error);
      }
    };
    
    addStructuredData();
  }, [config]);
  
  return null;
}
