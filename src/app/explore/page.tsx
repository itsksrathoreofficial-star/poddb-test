
"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { Tables } from '@/integrations/supabase/types';
import { PodcastCard } from '@/components/PodcastCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ExplorePageData {
    carouselItems: Tables<'explore_carousel'>[];
    top_podcasts: (Tables<'podcasts'> & { slug: string; is_verified?: boolean })[];
    latest_episodes: (Tables<'episodes'> & { slug: string, podcast_title: string, podcast_cover_image: string, is_verified?: boolean })[];
    featured_people: (Tables<'people'> & { slug: string, primary_role?: string; is_verified?: boolean })[];
}

export default function ExplorePage() {
  const [data, setData] = useState<ExplorePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchExplorePageData();
  }, []);

  const fetchExplorePageData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch carousel items separately (handle permission errors gracefully)
      let carouselData = [];
      try {
        const { data, error: carouselError } = await supabase
          .from('explore_carousel')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });

        if (carouselError) {
          console.warn('Carousel table not accessible:', carouselError.message);
          // Create fallback carousel data
          carouselData = [
            {
              id: 'fallback-1',
              title: 'Welcome to PodDB',
              description: 'Discover amazing podcasts and episodes',
              image_url: '/hero-bg.jpeg',
              redirect_link: '/explore'
            },
            {
              id: 'fallback-2', 
              title: 'Explore Categories',
              description: 'Browse podcasts by category',
              image_url: '/placeholder.svg',
              redirect_link: '/categories'
            }
          ];
        } else {
          carouselData = data || [];
          // If no carousel data, add fallback
          if (carouselData.length === 0) {
            carouselData = [
              {
                id: 'fallback-1',
                title: 'Welcome to PodDB',
                description: 'Discover amazing podcasts and episodes',
                image_url: '/hero-bg.jpeg',
                redirect_link: '/explore'
              }
            ];
          }
        }
      } catch (carouselError) {
        console.warn('Carousel table not accessible:', carouselError);
        // Create fallback carousel data
        carouselData = [
          {
            id: 'fallback-1',
            title: 'Welcome to PodDB',
            description: 'Discover amazing podcasts and episodes',
            image_url: '/hero-bg.jpeg',
            redirect_link: '/explore'
          }
        ];
      }

      // Fetch other data using RPC
      const { data: rpcData, error } = await supabase.rpc('get_homepage_data' as any);
      
      if (error) {
        console.error('RPC call failed:', error);
        // Fallback: try to fetch basic data directly
        const [podcastsResult, episodesResult, peopleResult, categoriesResult] = await Promise.all([
          supabase.from('podcasts').select('*').limit(10),
          supabase.from('episodes').select('*, podcasts(title, cover_image_url)').limit(10),
          supabase.from('people').select('*').limit(10),
          supabase.from('categories').select('*').limit(10)
        ]);

        const fallbackData = {
          top_podcasts: podcastsResult.data || [],
          latest_episodes: episodesResult.data || [],
          featured_people: peopleResult.data || [],
          categories: categoriesResult.data || [],
          carouselItems: carouselData
        };
        
        setData(fallbackData as any);
        return;
      }

      // Combine carousel data with RPC data
      const combinedData = {
        ...(rpcData as any),
        carouselItems: carouselData.length > 0 ? carouselData : [
          {
            id: 'fallback-1',
            title: 'Welcome to PodDB',
            description: 'Discover amazing podcasts and episodes',
            image_url: '/hero-bg.jpeg',
            redirect_link: '/explore'
          }
        ]
      };

      setData(combinedData as any);
    } catch (error: any) {
      console.error('Error fetching explore page data:', error);
      toast.error("Failed to load explore page content", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto py-8 px-4 space-y-16">
            <Skeleton className="h-[60vh] w-full rounded-lg" />
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-10 w-1/3 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-80 w-full" />)}
                    </div>
                </div>
            ))}
        </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20">Failed to load content. Please try again later.</div>;
  }

  return (
    <div className="space-y-16">
      {/* Hero Carousel Section */}
      {data.carouselItems?.length > 0 && (
        <section className="w-full">
            <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full"
            >
            <CarouselContent>
                {data.carouselItems.map((item) => (
                <CarouselItem key={item.id}>
                    <Link href={item.redirect_link}>
                    <div className="relative h-[60vh] w-full">
                        <Image
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.title || 'Carousel item'}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-10 left-10 text-white space-y-4 max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-bold text-shadow">{item.title}</h2>
                            <p className="text-lg text-shadow">{item.description}</p>
                            <Button variant="hero" size="lg">Learn More <ArrowRight className="ml-2"/></Button>
                        </div>
                    </div>
                    </Link>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
            </Carousel>
        </section>
      )}

      <div className="container mx-auto px-4 space-y-16">
        {/* Top Podcasts Section */}
        {data.top_podcasts?.length > 0 && (
            <section>
                <h2 className="text-3xl font-bold mb-6">Top Podcasts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.top_podcasts?.map((podcast) => (
                        <PodcastCard
                          key={podcast.id}
                          id={podcast.id}
                          slug={podcast.slug}
                          title={podcast.title}
                          description={podcast.description || ''}
                          coverImage={podcast.cover_image_url || '/placeholder.svg'}
                          totalEpisodes={podcast.total_episodes || 0}
                          totalViews={podcast.total_views || 0}
                          totalLikes={podcast.total_likes || 0}
                          categories={podcast.categories || []}
                          averageDuration={podcast.average_duration || 0}
                          lastEpisodeDate={podcast.last_episode_date || ''}
                          isVerified={podcast.is_verified}
                        />
                    ))}
                </div>
            </section>
        )}

        {/* Latest Episodes Section */}
        {data.latest_episodes?.length > 0 && (
            <section>
                <h2 className="text-3xl font-bold mb-6">Latest Episodes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.latest_episodes?.map(episode => (
                            <Link key={episode.id} href={`/episodes/${episode.slug || episode.id}`}>
                            <Card className="group cursor-pointer card-hover bg-card border-border h-full">
                                <div className="relative aspect-video overflow-hidden">
                                    <Image 
                                      src={episode.thumbnail_url || episode.podcast_cover_image || '/placeholder.svg'} 
                                      alt={episode.title || 'Episode'} 
                                      fill 
                                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <h4 className="font-semibold text-sm line-clamp-2 text-shadow">{episode.podcast_title}</h4>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{episode.title}</h3>
                                        {(episode as any).is_verified && <VerifiedBadge className="h-5 w-5 flex-shrink-0" />}
                                    </div>
                                </CardContent>
                            </Card>
                            </Link>
                        ))}
                    </div>
            </section>
        )}

        {/* Featured People Section */}
        {data.featured_people?.length > 0 && (
            <section>
                <h2 className="text-3xl font-bold mb-6">Featured People</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {data.featured_people?.map(person => (
                        <Link key={person.id} href={`/people/${person.slug || person.id}`}>
                        <div className="group text-center space-y-3 cursor-pointer">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 mx-auto ring-2 ring-border group-hover:ring-primary transition-all duration-300">
                                <AvatarImage src={person.photo_urls?.[0] || '/placeholder.svg'} alt={person.full_name || 'Person'}/>
                                <AvatarFallback>{person.full_name?.split(' ').map(n=>n[0]).join('') || 'P'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center justify-center gap-2">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{person.full_name}</h3>
                                    {person.is_verified && <VerifiedBadge className="h-5 w-5 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">{ (person as any).primary_role || 'Creator'}</p>
                            </div>
                        </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
}
