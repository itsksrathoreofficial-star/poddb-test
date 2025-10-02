"use client";
import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, Eye, Heart, PlayCircle, Calendar, Loader2, ArrowUp, ArrowDown, Minus, Star, MessageCircle, Timer } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { 
  type RankingData,
  type WeeklyRankingData,
  type MonthlyRankingData
} from '@/app/actions/ranking';
import StructuredData from './structured-data';
import { SEOConfig } from '@/lib/seo-generator';
import SEOOptimizer from '@/components/SEOOptimizer';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

interface RankingItem {
  id: string;
  slug: string;
  rank: number;
  title: string;
  categories: string[];
  total_views: number;
  total_likes: number;
  cover_image_url: string;
  total_episodes: number;
  type: 'podcasts' | 'episodes';
  podcast_title?: string;
  is_verified?: boolean;
  weekly_views?: number;
  monthly_views?: number;
  daily_views_gain?: number;
  daily_likes_gain?: number;
  daily_comments_gain?: number;
  daily_watch_time_gain?: number;
}

interface RankingsClientProps {
  initialData: {
    overallRankings: RankingData[];
    weeklyRankings: WeeklyRankingData[];
    monthlyRankings: MonthlyRankingData[];
    episodesOverallRankings: any[];
    episodesWeeklyRankings: any[];
    episodesMonthlyRankings: any[];
    categories: { category: string }[];
    languages: { language: string }[];
    locations: { location: string }[];
  };
}

export default function RankingsClient({ initialData }: RankingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [overallRankings, setOverallRankings] = useState<RankingData[]>(initialData.overallRankings);
  const [weeklyRankings, setWeeklyRankings] = useState<WeeklyRankingData[]>(initialData.weeklyRankings);
  const [monthlyRankings, setMonthlyRankings] = useState<MonthlyRankingData[]>(initialData.monthlyRankings);
  const [episodesOverallRankings, setEpisodesOverallRankings] = useState<any[]>(initialData.episodesOverallRankings);
  const [episodesWeeklyRankings, setEpisodesWeeklyRankings] = useState<any[]>(initialData.episodesWeeklyRankings);
  const [episodesMonthlyRankings, setEpisodesMonthlyRankings] = useState<any[]>(initialData.episodesMonthlyRankings);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ category: string }[]>(initialData.categories);
  const [languages, setLanguages] = useState<{ language: string }[]>(initialData.languages);
  const [locations, setLocations] = useState<{ location: string }[]>(initialData.locations);
  const [states, setStates] = useState<{ state: string }[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'overall'>(searchParams.get('period') as any || 'weekly');
  const [selectedType, setSelectedType] = useState<'podcasts' | 'episodes'>(searchParams.get('type') as any || 'podcasts');
  
  const searchTerm = searchParams.get('q') || '';
  
  // Create SEO config for structured data
  const seoConfig: SEOConfig = {
    type: selectedType,
    period: selectedPeriod,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    state: selectedState !== 'all' ? selectedState : undefined,
  };
  
  useEffect(() => {
    if (selectedType !== 'podcasts' || selectedPeriod !== 'weekly') {
      fetchRankings();
    }
  }, [selectedType, selectedPeriod, selectedCategory, selectedLanguage, selectedLocation, selectedState]);

  // Add periodic refresh for fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedType !== 'podcasts' || selectedPeriod !== 'weekly') {
        fetchRankings();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [selectedType, selectedPeriod]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Add cache busting to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      
      // Fetch all rankings from API routes with cache busting
      const [overallRes, weeklyRes, monthlyRes, episodesOverallRes, episodesWeeklyRes, episodesMonthlyRes] = await Promise.all([
        fetch(`/api/rankings/overall${cacheBuster}`),
        fetch(`/api/rankings/weekly-chart${cacheBuster}`),
        fetch(`/api/rankings/monthly-chart${cacheBuster}`),
        fetch(`/api/rankings/episodes-overall${cacheBuster}`),
        fetch(`/api/rankings/episodes-weekly${cacheBuster}`),
        fetch(`/api/rankings/episodes-monthly${cacheBuster}`)
      ]);

      const [overall, weekly, monthly, episodesOverall, episodesWeekly, episodesMonthly] = await Promise.all([
        overallRes.json(),
        weeklyRes.json(),
        monthlyRes.json(),
        episodesOverallRes.json(),
        episodesWeeklyRes.json(),
        episodesMonthlyRes.json()
      ]);

      if (overallRes.ok) {
        // Calculate daily gains for overall rankings
        const overallWithGains = await Promise.all(
          overall.map(async (podcast: any) => {
            try {
              const dailyGainRes = await fetch(`/api/rankings/daily-gain?podcastId=${podcast.id}`);
              const dailyGain = await dailyGainRes.json();
              return {
                ...podcast,
                daily_views_gain: dailyGain.views || 0,
                daily_likes_gain: dailyGain.likes || 0,
                daily_comments_gain: dailyGain.comments || 0,
                daily_watch_time_gain: dailyGain.watchTime || 0
              };
            } catch (error) {
              console.error(`Error fetching daily gain for podcast ${podcast.id}:`, error);
              return {
                ...podcast,
                daily_views_gain: 0,
                daily_likes_gain: 0,
                daily_comments_gain: 0,
                daily_watch_time_gain: 0
              };
            }
          })
        );
        setOverallRankings(overallWithGains);
      } else {
        console.error('Error fetching overall rankings:', overall);
      }

      if (weeklyRes.ok) {
        setWeeklyRankings(weekly);
      } else {
        console.error('Error fetching weekly rankings:', weekly);
      }

      if (monthlyRes.ok) {
        setMonthlyRankings(monthly);
      } else {
        console.error('Error fetching monthly rankings:', monthly);
      }

      if (episodesOverallRes.ok) {
        setEpisodesOverallRankings(episodesOverall);
      } else {
        console.error('Error fetching episodes overall rankings:', episodesOverall);
      }

      if (episodesWeeklyRes.ok) {
        setEpisodesWeeklyRankings(episodesWeekly);
      } else {
        console.error('Error fetching episodes weekly rankings:', episodesWeekly);
      }

      if (episodesMonthlyRes.ok) {
        setEpisodesMonthlyRankings(episodesMonthly);
      } else {
        console.error('Error fetching episodes monthly rankings:', episodesMonthly);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast.error('Failed to fetch rankings');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRankings = () => {
    if (selectedType === 'episodes') {
      switch (selectedPeriod) {
        case 'overall':
          return episodesOverallRankings;
        case 'weekly':
          return episodesWeeklyRankings;
        case 'monthly':
          return episodesMonthlyRankings;
        default:
          return episodesWeeklyRankings;
      }
    } else {
      switch (selectedPeriod) {
        case 'overall':
          return overallRankings;
        case 'weekly':
          return weeklyRankings;
        case 'monthly':
          return monthlyRankings;
        default:
          return weeklyRankings;
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRankChangeIcon = (change?: number) => {
    if (change === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getRankChangeColor = (change?: number) => {
    if (change === undefined) return 'text-gray-400';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getRankingTitle = () => {
    switch (selectedPeriod) {
      case 'overall':
        return 'Overall Rankings';
      case 'weekly':
        return 'Weekly Rankings';
      case 'monthly':
        return 'Monthly Rankings';
      default:
        return 'Weekly Rankings';
    }
  };

  const getRankingDescription = () => {
    switch (selectedPeriod) {
      case 'overall':
        return 'Ranked by total views across all time';
      case 'weekly':
        return 'Ranked by views gained in the last 7 days';
      case 'monthly':
        return 'Ranked by views gained in the last 30 days';
      default:
        return 'Ranked by views gained in the last 7 days';
    }
  };

  const getRankingMetric = (podcast: any) => {
    switch (selectedPeriod) {
      case 'overall':
        return { value: podcast.total_views, label: 'Total Views' };
      case 'weekly':
        return { value: podcast.weekly_views, label: 'Weekly Views' };
      case 'monthly':
        return { value: podcast.monthly_views, label: 'Monthly Views' };
      default:
        return { value: podcast.weekly_views, label: 'Weekly Views' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading rankings...</p>
        </div>
      </div>
    );
  }

  const currentRankings = getCurrentRankings();
  const filteredRankings = currentRankings.filter((item: any) => {
    // Category filter
    if (selectedCategory !== 'all' && !item.categories?.includes(selectedCategory)) {
      return false;
    }
    
    // Language filter
    if (selectedLanguage !== 'all' && item.language !== selectedLanguage) {
      return false;
    }
    
    // Location filter
    if (selectedLocation !== 'all' && item.location !== selectedLocation) {
      return false;
    }
    
    return true;
  });

  const topThree = filteredRankings.slice(0, 3);
  const otherItems = filteredRankings.slice(3);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`h-6 w-6 ${getRankColor(rank)}`} />;
    return <span className={`font-bold text-2xl ${getRankColor(rank)}`}>#{rank}</span>;
  };

  const handleItemClick = (item: any) => {
    if (item.type === 'episodes') {
      router.push(`/episodes/${item.slug}`);
    } else {
      router.push(`/podcasts/${item.slug}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* SEO Optimizer */}
      <SEOOptimizer config={seoConfig} rankings={filteredRankings} />
      
      {/* Structured Data */}
      <StructuredData config={seoConfig} />
      
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Podcast Rankings</h1>
            <p className="text-muted-foreground text-lg">
              Discover the most popular podcasts based on real engagement data
            </p>
          </div>
        </div>
        {searchTerm && (
            <div className="text-lg text-muted-foreground">
                Search results for: <span className="font-semibold text-foreground">&quot;{searchTerm}&quot;</span>
            </div>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select value={selectedType} onValueChange={(value: 'podcasts' | 'episodes') => setSelectedType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="podcasts">Podcasts</SelectItem>
                  <SelectItem value="episodes">Episodes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={(value: 'weekly' | 'monthly' | 'overall') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="overall">Overall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.language} value={lang.language}>
                      {lang.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.location} value={loc.location}>
                      {loc.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Updated daily</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Special Section */}
      {topThree.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl">🏆 Top 3 Champions</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-end justify-center space-x-2 sm:space-x-8">
              {/* 2nd Place */}
              {topThree.length >= 2 && (
                <div className="text-center space-y-2 cursor-pointer w-1/3" onClick={() => handleItemClick(topThree[1])}>
                  <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
                    <Image
                      src={topThree[1]?.cover_image_url || '/placeholder.svg'}
                      alt={topThree[1]?.title}
                      fill
                      className="rounded-xl object-cover"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      2
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">{topThree[1]?.title}</h3>
                      {topThree[1]?.is_verified && <VerifiedBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(getRankingMetric(topThree[1]).value)} {getRankingMetric(topThree[1]).label.toLowerCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center space-y-2 cursor-pointer w-1/3" onClick={() => handleItemClick(topThree[0])}>
                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                  <Image
                    src={topThree[0]?.cover_image_url || '/placeholder.svg'}
                    alt={topThree[0]?.title}
                    fill
                    className="rounded-xl object-cover ring-4 ring-yellow-500"
                  />
                  <div className="absolute -top-3 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    👑
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <h3 className="font-semibold text-sm sm:text-lg line-clamp-2">{topThree[0]?.title}</h3>
                    {topThree[0]?.is_verified && <VerifiedBadge />}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatNumber(getRankingMetric(topThree[0]).value)} {getRankingMetric(topThree[0]).label.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* 3rd Place */}
              {topThree.length >= 3 && (
                <div className="text-center space-y-2 cursor-pointer w-1/3" onClick={() => handleItemClick(topThree[2])}>
                  <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
                    <Image
                      src={topThree[2]?.cover_image_url || '/placeholder.svg'}
                      alt={topThree[2]?.title}
                      fill
                      className="rounded-xl object-cover"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      3
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">{topThree[2]?.title}</h3>
                      {topThree[2]?.is_verified && <VerifiedBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(getRankingMetric(topThree[2]).value)} {getRankingMetric(topThree[2]).label.toLowerCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {searchTerm ? `Search Results` : `Top 100 ${selectedType === 'podcasts' ? 'Podcasts' : 'Episodes'} - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`}
          </h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Live Rankings
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-6 bg-muted rounded" />
                    <div className="w-16 h-16 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                    <div className="w-20 h-6 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRankings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Rankings Available</h3>
                  <p className="text-muted-foreground">
                    No {selectedType} found for the selected criteria. Try adjusting your filters.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(searchTerm ? filteredRankings : otherItems).map((item, index) => {
              const rankingMetric = getRankingMetric(item);
              const actualRank = searchTerm ? index + 1 : index + 4; // Since we show top 3 separately
              
              return (
                <Card
                  key={item.id}
                  className="group cursor-pointer card-hover bg-card border-border"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 sm:w-16">
                        {getRankIcon(actualRank)}
                      </div>

                      {/* Cover Image */}
                      <div className="relative shrink-0">
                        <Image
                          src={getSafeImageUrl(item.cover_image_url, '/placeholder.svg')}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                          onError={handleImageError}
                        />
                        {actualRank <= 3 && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-primary text-primary-foreground text-xs px-1 py-0">
                              TOP
                            </Badge>
                          </div>
                        )}

                      </div>

                      {/* Content Info */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </h3>
                          {item.is_verified && <VerifiedBadge />}
                        </div>
                        {item.type === 'episodes' && item.podcast_title && (
                          <p className="text-sm text-muted-foreground truncate">
                            from {item.podcast_title}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-1">
                            {item.categories?.slice(0, 2).map((category: any, catIndex: number) => (
                              <Badge key={catIndex} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(rankingMetric.value)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{formatNumber(item.total_likes)}</span>
                          </div>
                          {item.daily_views_gain !== undefined && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <ArrowUp className="h-3 w-3" />
                              <span>+{formatNumber(item.daily_views_gain)} today</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleItemClick(item)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredRankings.length > 0 && (
          <div className="text-center pt-8">
            <Button variant="outline" size="lg">
              Load More Rankings
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredRankings.length} of {filteredRankings.length} {selectedType}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
