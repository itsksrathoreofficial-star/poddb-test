"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdDebugProps {
  pageName: string;
  placement: string;
  deviceType: string;
}

const AdDebug: React.FC<AdDebugProps> = ({ pageName, placement, deviceType }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAds();
  }, [pageName, placement, deviceType]);

  const checkAds = async () => {
    try {
      setLoading(true);
      
      // Get all active ads
      const { data: allAds, error: allAdsError } = await supabase
        .from('ad_configs')
        .select('*')
        .eq('status', 'active');

      if (allAdsError) throw allAdsError;

      const debugData = {
        pageName,
        placement,
        deviceType,
        totalActiveAds: allAds?.length || 0,
        adsForThisPage: allAds?.filter(ad => {
          const pageMatches = (ad as any).pages.includes(pageName) || (ad as any).pages.includes('all');
          const placementMatches = (ad as any).placement === placement;
          const deviceMatches = (ad as any).devices.includes(deviceType);
          return pageMatches && placementMatches && deviceMatches;
        }) || [],
        allAds: allAds || []
      };

      setDebugInfo(debugData);
    } catch (error: any) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Loading debug info...</div>;
  }

  if (!debugInfo) {
    return <div className="p-4 bg-red-100 text-red-800 rounded">No debug info available</div>;
  }

  return (
    <div className="p-4 bg-blue-100 text-blue-800 rounded text-sm">
      <h3 className="font-bold mb-2">Ad Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Page:</strong> {debugInfo.pageName}</div>
        <div><strong>Placement:</strong> {debugInfo.placement}</div>
        <div><strong>Device:</strong> {debugInfo.deviceType}</div>
        <div><strong>Total Active Ads:</strong> {debugInfo.totalActiveAds}</div>
        <div><strong>Ads for this page+placement+device:</strong> {debugInfo.adsForThisPage.length}</div>
        {debugInfo.adsForThisPage.length > 0 && (
          <div className="mt-2">
            <strong>Matching Ads:</strong>
            <ul className="ml-4">
              {debugInfo.adsForThisPage.map((ad: any, index: number) => (
                <li key={index}>
                  {ad.name} - Pages: {JSON.stringify(ad.pages)} - Placement: {ad.placement} - Devices: {JSON.stringify(ad.devices)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdDebug;
