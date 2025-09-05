
"use client";
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Database, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import heroImage from '@/assets/hero-bg.jpeg';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from './ui/skeleton';

export function Hero() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [stats, setStats] = useState({
    podcast_count: 0,
    episode_count: 0,
    creator_count: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const { data, error } = await supabase.rpc('get_db_stats');
        if (error) throw error;
        setStats(data[0] || { podcast_count: 0, episode_count: 0, creator_count: 0 });
      } catch (error) {
        console.error('Error fetching DB stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/rankings');
    }
  };
  
  const formatStatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toLocaleString();
  };

  const Stat = ({ value, label, loading }: { value: number, label: string, loading: boolean }) => (
    <div className="text-center space-y-2">
      {loading ? (
        <Skeleton className="h-10 w-24 mx-auto" />
      ) : (
        <div className="text-3xl md:text-4xl font-bold text-primary">{formatStatNumber(value)}</div>
      )}
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );


  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage.src}
          alt="PodDB Pro - Professional Podcast Database"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-shadow">
              The World's Largest
              <span className="text-primary block mt-2">Podcast Database</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Discover, explore, and contribute to the most comprehensive database of podcasts, episodes, and creators. The IMDb of podcasts.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for podcasts, episodes, or people..."
                className="pl-12 pr-4 py-4 text-lg bg-card/90 backdrop-blur border-border focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="hero" size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/rankings">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Top Rankings
              </Button>
            </Link>
            {user ? (
              <Link href="/contribute">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Database className="mr-2 h-5 w-5" />
                  Contribute Data
                </Button>
              </Link>
            ) : (
              <Link href="/auth?type=signup">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
            <Stat value={stats.podcast_count} label="Podcasts" loading={loadingStats} />
            <Stat value={stats.episode_count} label="Episodes" loading={loadingStats} />
            <Stat value={stats.creator_count} label="Creators" loading={loadingStats} />
          </div>
        </div>
      </div>
    </section>
  );
}
