import React from 'react';
import Image from 'next/image';
import { Hero } from '@/components/Hero';
import { PodcastCard } from '@/components/PodcastCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Clock, Users, ArrowRight, Zap, Play, Newspaper, User } from 'lucide-react';
import { getSafeImageUrl, normalizeImageUrl } from '@/lib/image-utils';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Script from 'next/script';
import AdPlacement from '@/components/AdManager/AdPlacement';

interface Podcast {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  total_episodes: number;
  total_views: number;
  total_likes: number;
  categories: string[];
  average_duration: number;
  last_episode_date: string;
  is_verified: boolean;
  average_rating: number;
  rating_count: number;
}

interface Episode {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  podcast_id: string;
  podcast_title: string;
  podcast_cover: string;
  podcasts: {
    title: string;
    cover_image_url: string;
  }[];
}

interface Person {
    id: string;
    slug: string;
    full_name: string;
    photo_urls: string[] | null;
    total_appearances: number;
    primary_role?: string;
}

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image_url: string;
    published_at: string;
}

interface Category {
    category: string;
    podcast_count?: number;
}

interface HomepageData {
  top_podcasts: Podcast[];
  latest_episodes: Episode[];
  featured_people: Person[];
  latest_news: NewsArticle[];
  categories: Category[];
}

interface StaticHomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
  data: HomepageData;
}

export default function StaticHomePage({ searchParams, data }: StaticHomePageProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PodDB Pro",
    "url": "https://poddb.pro",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://poddb.pro/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "description": "The IMDb for podcasts. Discover, explore, and contribute to the largest, community-powered podcast database in the world."
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "PodDB Pro - The Podcast Database",
    "description": "A comprehensive, community-powered dataset of podcasts, episodes, creators, and guests, providing detailed information, statistics, and relationship mapping within the podcasting industry. Considered the IMDb for podcasts.",
    "url": "https://poddb.pro",
    "keywords": [
        "podcast",
        "podcasting",
        "podcast database",
        "podcast directory",
        "episodes",
        "podcast creators",
        "podcast guests",
        "radio",
        "audio content"
    ],
    "creator": {
        "@type": "Organization",
        "name": "PodDB Pro"
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="dataset-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      <Hero />

      {/* Content Ad at top */}
      <AdPlacement placement="content" className="container mx-auto px-4 py-6" />

      {/* Top Podcasts Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">Top Podcasts</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our most popular and trending podcasts, loved by the community
            </p>
          </div>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {data?.top_podcasts?.map((podcast) => (
                <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex">
                   <div className="p-1 w-full">
                    <PodcastCard
                      id={podcast.id}
                      slug={podcast.slug}
                      title={podcast.title}
                      description={podcast.description}
                      coverImage={podcast.cover_image_url}
                      totalEpisodes={podcast.total_episodes}
                      totalViews={podcast.total_views}
                      totalLikes={podcast.total_likes}
                      categories={podcast.categories || []}
                      averageDuration={podcast.average_duration}
                      lastEpisodeDate={podcast.last_episode_date}
                      isVerified={podcast.is_verified}
                      averageRating={podcast.average_rating}
                      ratingCount={podcast.rating_count}
                      simplified={true}
                    />
                   </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex" />
            <CarouselNext className="hidden lg:flex" />
          </Carousel>
          <div className="text-center mt-12">
            <Link href="/rankings">
              <Button variant="hero" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                View All Rankings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Between Content Ad */}
      <AdPlacement placement="between_content" className="container mx-auto px-4 py-6" />

      {/* Latest Episodes Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl md:text-5xl font-bold">Latest Episodes</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Catch up on the newest releases from top podcasts
                </p>
            </div>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {data?.latest_episodes?.map(episode => (
                  <CarouselItem key={episode.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex">
                    <div className="p-1 w-full">
                      <Link href={`/episodes/${episode.slug}`}>
                        <Card className="group cursor-pointer card-hover bg-background border-border h-full">
                                                         <div className="relative aspect-video overflow-hidden">
                                 <Image 
                                    src={getSafeImageUrl(episode.thumbnail_url || episode.podcasts?.[0]?.cover_image_url, '/placeholder.svg')}
                                   alt={episode.title || 'Episode'} 
                                   fill 
                                   className="object-cover transition-transform duration-300 group-hover:scale-105"
                                 />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-3 left-3 text-white">
                                    <h4 className="font-semibold text-sm line-clamp-2 text-shadow">{episode.podcasts?.[0]?.title || episode.podcast_title}</h4>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Clock className="h-3 w-3"/>
                                    <span>{formatDuration(episode.duration)}</span>
                                </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{episode.title}</h3>
                            </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
        </div>
                  </section>

      {/* Content Ad between sections */}
      <AdPlacement placement="content" className="container mx-auto px-4 py-6" />

      {/* Featured People Section */}
        <section className="py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold">Featured People</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover the hosts, guests, and creators shaping the podcasting world
                    </p>
                </div>
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent>
                    {data?.featured_people?.map(person => (
                      <CarouselItem key={person.id} className="basis-1/2 md:basis-1/4 lg:basis-1/6 flex">
                        <div className="p-1 w-full">
                          <Link href={`/people/${person.slug}`}>
                            <div className="group text-center space-y-3 cursor-pointer">
                                                         <Avatar className="h-32 w-32 mx-auto ring-2 ring-border group-hover:ring-primary transition-all duration-300">
                                 <AvatarImage 
                                   src={getSafeImageUrl(person.photo_urls?.[0], '/placeholder.svg')} 
                                   alt={person.full_name || 'Person'}
                                 />
                                 <AvatarFallback>{person.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                             </Avatar>
                            <div>
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{person.full_name}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{person.primary_role || 'Creator'}</p>
                            </div>
                            </div>
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden lg:flex" />
                  <CarouselNext className="hidden lg:flex" />
                </Carousel>
                 <div className="text-center mt-12">
                    <Link href="/people">
                    <Button variant="outline" size="lg">
                        Explore All People
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    </Link>
                </div>
            </div>
        </section>

      {/* Categories Section */}
        <section className="py-20 px-4 bg-card">
            <div className="container mx-auto">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl md:text-5xl font-bold">Browse by Category</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore podcasts across different genres and topics
                </p>
            </div>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {data?.categories?.map((cat) => (
                  <CarouselItem key={cat.category} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex">
                    <div className="p-1 w-full">
                      <Link href={`/categories?name=${encodeURIComponent(cat.category)}`}>
                        <Card className="group cursor-pointer card-hover bg-background border-border h-full">
                            <CardContent className="p-6 text-center space-y-4 flex flex-col justify-center items-center h-full">
                            <div>
                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                {cat.category}
                                </h3>
                                <p className="text-muted-foreground">
                                {cat.podcast_count?.toLocaleString() || 0} podcasts
                                </p>
                            </div>
                            </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>

            <div className="text-center mt-12">
                <Link href="/categories">
                <Button variant="outline" size="lg">
                    View All Categories
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                </Link>
            </div>
            </div>
        </section>

      {/* Latest News Section */}
       <section className="py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold">Latest News</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stay updated with trends and announcements in the podcasting industry
                    </p>
                </div>
                 <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent>
                      {data?.latest_news?.map(article => (
                        <CarouselItem key={article.id} className="md:basis-1/2 lg:basis-1/3 flex">
                          <div className="p-1 w-full">
                            <Link href={`/news/${article.slug}`}>
                                <Card className="group cursor-pointer card-hover bg-card border-border h-full flex flex-col">
                                                                         <div className="aspect-video overflow-hidden rounded-t-lg relative">
                                     <Image 
                                       src={getSafeImageUrl(article.featured_image_url, '/placeholder.svg')} 
                                       alt={article.title || 'News article'} 
                                       fill 
                                       className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                       data-ai-hint="article news"
                                     />
                                 </div>
                                <CardContent className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{article.excerpt}</p>
                                    <p className="text-xs text-muted-foreground mt-4">{new Date(article.published_at).toLocaleDateString()}</p>
                                </CardContent>
                            </Card>
                            </Link>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden lg:flex" />
                    <CarouselNext className="hidden lg:flex" />
                 </Carousel>
                 <div className="text-center mt-12">
                    <Link href="/news">
                    <Button variant="hero" size="lg">
                        Read More News
                        <Newspaper className="ml-2 h-5 w-5" />
                    </Button>
                    </Link>
                </div>
            </div>
        </section>

      {/* Footer Ad */}
      <AdPlacement placement="footer" className="container mx-auto px-4 py-6" />
    </div>
  );
}
