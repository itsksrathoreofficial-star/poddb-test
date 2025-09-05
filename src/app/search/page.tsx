
"use client";
import React, { useState, useEffect, Suspense } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Podcast, Clapperboard, Users, Eye, Heart, PlayCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

interface PodcastResult {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  total_episodes: number;
}
interface EpisodeResult {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  podcast_title: string;
  podcast_id: string;
}
interface PersonResult {
  id: string;
  slug: string;
  full_name: string;
  photo_urls: string[] | null;
  bio: string | null;
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    podcasts: PodcastResult[];
    episodes: EpisodeResult[];
    people: PersonResult[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) {
      performSearch(initialQuery);
    } else {
        setResults(null);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
        setResults(null);
        return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('global_search', { search_term: searchTerm } as any);
      if (error) throw error;
      setResults(data);
    } catch (error: any) {
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header and Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <Search className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Search Results</h1>
            <p className="text-muted-foreground text-lg">
              {initialQuery ? `Showing results for "${initialQuery}"` : 'Find podcasts, episodes, and people'}
            </p>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search anything..."
              className="pl-10 text-base py-3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="hero" className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !results || (!results.podcasts?.length && !results.episodes?.length && !results.people?.length) ? (
         <Card className="text-center py-16">
           <p className="text-muted-foreground">{initialQuery ? `No results found for "${query}". Try a different search term.` : "Please enter a search term to begin."}</p>
         </Card>
      ) : (
        <Tabs defaultValue="podcasts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="podcasts">
              <Podcast className="mr-2" /> Podcasts ({results.podcasts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="episodes">
              <Clapperboard className="mr-2" /> Episodes ({results.episodes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="people">
              <Users className="mr-2" /> People ({results.people?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="podcasts" className="mt-6">
            <div className="space-y-4">
              {results.podcasts?.map(podcast => (
                 <Link key={podcast.id} href={`/podcasts/${podcast.slug}`}>
                    <Card className="group cursor-pointer card-hover">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="relative w-20 h-20 shrink-0">
                           <Image 
                             src={getSafeImageUrl(podcast.cover_image_url, '/placeholder.svg')} 
                             alt={podcast.title} 
                             fill 
                             className="rounded-lg object-cover"
                             onError={handleImageError}
                           />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{podcast.title}</h3>
                        </div>
                        <Button variant="ghost">View</Button>
                    </CardContent>
                    </Card>
                 </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="episodes" className="mt-6">
            <div className="space-y-4">
              {results.episodes?.map(episode => (
                <Link key={episode.id} href={`/episodes/${episode.slug}`}>
                  <Card className="group cursor-pointer card-hover">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="relative w-20 h-20 shrink-0">
                        <Image 
                          src={getSafeImageUrl(episode.thumbnail_url, '/placeholder.svg')} 
                          alt={episode.title} 
                          fill 
                          className="rounded-lg object-cover"
                          onError={(e) => handleImageError(e)}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{episode.title}</h3>
                        <p className="text-sm text-muted-foreground">from {episode.podcast_title}</p>
                      </div>
                      <Button variant="ghost">View</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="people" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.people?.map(person => (
                <Link key={person.id} href={`/people/${person.slug}`}>
                    <Card className="group cursor-pointer card-hover">
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                            <Avatar className="h-24 w-24">
                                <AvatarImage 
                                  src={getSafeImageUrl(person.photo_urls?.[0], '/placeholder.svg')} 
                                  alt={person.full_name}
                                  onError={handleImageError}
                                />
                                <AvatarFallback>{person.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{person.full_name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{person.bio}</p>
                        </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <SearchResults />
        </Suspense>
    )
}
