import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RankingsClient from './RankingsClient';
import { createClient } from '@/integrations/supabase/server';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-fetch rankings data at build time
async function getRankingsData() {
  try {
    // Check if we're in build mode - if so, return empty data to avoid API calls
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
      return {
        overallRankings: [],
        weeklyRankings: [],
        monthlyRankings: [],
        episodesOverallRankings: [],
        episodesWeeklyRankings: [],
        episodesMonthlyRankings: [],
        categories: [],
        languages: [],
        locations: []
      };
    }

    // Fetch all rankings data
      const [overallRes, weeklyRes, monthlyRes, episodesOverallRes, episodesWeeklyRes, episodesMonthlyRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/overall`),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/weekly-chart`),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/monthly-chart`),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/episodes-overall`),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/episodes-weekly`),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rankings/episodes-monthly`)
      ]);

      // Check if all responses are ok
      const responses = [overallRes, weeklyRes, monthlyRes, episodesOverallRes, episodesWeeklyRes, episodesMonthlyRes];
      const failedResponses = responses.filter(res => !res.ok);
      
      if (failedResponses.length > 0) {
        console.warn('Some ranking API calls failed, returning empty data');
        return {
          overallRankings: [],
          weeklyRankings: [],
          monthlyRankings: [],
          episodesOverallRankings: [],
          episodesWeeklyRankings: [],
          episodesMonthlyRankings: [],
          categories: [],
          languages: [],
          locations: []
        };
      }

      const [overall, weekly, monthly, episodesOverall, episodesWeekly, episodesMonthly] = await Promise.all([
        overallRes.json(),
        weeklyRes.json(),
        monthlyRes.json(),
        episodesOverallRes.json(),
        episodesWeeklyRes.json(),
        episodesMonthlyRes.json()
      ]);

    // Fetch filter data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [categoriesRes, languagesRes, locationsRes] = await Promise.all([
      supabase.from('podcasts').select('categories').not('categories', 'is', null),
      supabase.from('podcasts').select('language').not('language', 'is', null),
      supabase.from('podcasts').select('location').not('location', 'is', null)
    ]);

    const uniqueCategories = Array.from(
      new Set(categoriesRes.data?.flatMap(item => item.categories || []) || [])
    ).map(category => ({ category }));

    const uniqueLanguages = Array.from(
      new Set(languagesRes.data?.map(item => item.language).filter(Boolean) || [])
    ).map(language => ({ language }));

    const uniqueLocations = Array.from(
      new Set(locationsRes.data?.map(item => item.location).filter(Boolean) || [])
    ).map(location => ({ location }));

              return {
      overallRankings: overallRes.ok ? overall : [],
      weeklyRankings: weeklyRes.ok ? weekly : [],
      monthlyRankings: monthlyRes.ok ? monthly : [],
      episodesOverallRankings: episodesOverallRes.ok ? episodesOverall : [],
      episodesWeeklyRankings: episodesWeeklyRes.ok ? episodesWeekly : [],
      episodesMonthlyRankings: episodesMonthlyRes.ok ? episodesMonthly : [],
      categories: uniqueCategories,
      languages: uniqueLanguages,
      locations: uniqueLocations,
              };
            } catch (error) {
    console.error('Error fetching rankings data:', error);
    return {
      overallRankings: [],
      weeklyRankings: [],
      monthlyRankings: [],
      episodesOverallRankings: [],
      episodesWeeklyRankings: [],
      episodesMonthlyRankings: [],
      categories: [],
      languages: [],
      locations: [],
    };
  }
}

export default async function Rankings() {
  const initialData = await getRankingsData();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
      <RankingsClient initialData={initialData} />
    </Suspense>
  );
}