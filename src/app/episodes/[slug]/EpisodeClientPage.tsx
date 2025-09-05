
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayer } from '@/components/PlayerProvider';
import { StarRating } from '@/components/StarRating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { Eye, Heart, Clock, Play, Star, Calendar, HelpCircle, PlayCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import PodcastPlayer from '@/components/PodcastPlayer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';
  
type EpisodeWithPodcastAndReviews = Tables<'episodes'> & {
  podcasts: Pick<Tables<'podcasts'>, 'id' | 'title' | 'cover_image_url' | 'slug' | 'is_verified'>;
  reviews: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null })[];
};

interface EpisodeClientPageProps {
  episode: EpisodeWithPodcastAndReviews;
}

export default function EpisodeClientPage({ episode }: EpisodeClientPageProps) {
  console.log('[EpisodeClientPage] Received episode prop:', JSON.stringify(episode, null, 2));

  const { play, loadTrack } = usePlayer();
  const [visibleContent, setVisibleContent] = useState(1200); // Show first 600 characters initially

  const handlePlay = () => {
    if (!episode.youtube_video_id) {
      console.error('No YouTube video ID available for episode:', episode.id);
      return;
    }

    const track = {
      id: episode.id,
      title: episode.title,
      youtube_video_id: episode.youtube_video_id,
      coverImage: episode.thumbnail_url || episode.podcasts.cover_image_url || '',
      podcastTitle: episode.podcasts.title,
    };
    
    console.log('Playing track:', track);
    
    // Load the track and create a playlist with just this episode
    const playlist = [track];
    loadTrack(track, playlist);
    play(track, playlist);
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    // Use consistent formatting to avoid hydration mismatch
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const seoData = episode.seo_metadata as any;

  // Compute average_rating and rating_count from valid reviews
  const validReviews = (episode.reviews || []).filter(
    (review): review is Tables<'reviews'> & { profiles: Tables<'profiles'> | null } =>
      review != null && typeof review.rating === 'number'
  );
  const computedRatingCount = validReviews.length;
  const computedAverageRating = computedRatingCount > 0
    ? validReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / computedRatingCount
    : 0;

  // Check if description is long enough to need show more
  const isLongDescription = episode.description && episode.description.length > 600;
  const hasMoreContent = episode.description && visibleContent < episode.description.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Header Section */}
          <header className="space-y-4">
            <Link href={`/podcasts/${episode.podcasts.slug || episode.podcasts.id}`} className="text-primary hover:underline">
              &larr; Back to {episode.podcasts.title}
            </Link>
            
            <div className="flex items-start space-x-6">
              <div className="relative w-48 h-48 shrink-0">
                <Image
                  src={getSafeImageUrl(episode.thumbnail_url || episode.podcasts.cover_image_url, '/placeholder.svg')}
                  alt={episode.title}
                  fill
                  className="rounded-lg object-cover"
                  onError={handleImageError}
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{episode.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Link href={`/podcasts/${episode.podcasts.slug || episode.podcasts.id}`} className="text-xl text-primary hover:underline">
                      {episode.podcasts.title}
                    </Link>
                    {episode.podcasts.is_verified && <VerifiedBadge className="h-6 w-6" />}
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4"/>
                    <span>{formatDate(episode.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4"/>
                    <span>{formatDuration(episode.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4"/>
                    <span>{formatNumber(episode.views)} Views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4"/>
                    <span>{formatNumber(episode.likes)} Likes</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button onClick={handlePlay} variant="hero" size="lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Play Episode
                  </Button>
                  
                  <Button variant="outline" size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {episode.description?.slice(0, visibleContent)}
                  {hasMoreContent && '...'}
                </p>
                {isLongDescription && hasMoreContent && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setVisibleContent(prev => prev + 1000)}
                      className="text-primary hover:text-primary w-full"
                    >
                      Show More
                    </Button>
                  </div>
                )}
                {isLongDescription && !hasMoreContent && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setVisibleContent(600)}
                      className="text-primary hover:text-primary w-full"
                    >
                      Show Less
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({episode.reviews?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reviews">Reviews ({episode.reviews?.length || 0})</TabsTrigger>
                  <TabsTrigger value="write-review">Write a Review</TabsTrigger>
                </TabsList>
                <TabsContent value="reviews" className="mt-6">
                  <ReviewsList reviews={episode.reviews as any || []} />
                </TabsContent>
                <TabsContent value="write-review" className="mt-6">
                  <ReviewForm targetId={episode.id} targetTable="episodes" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* AI Generated FAQs */}
          {seoData?.faqs && seoData.faqs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {seoData.faqs.map((faq: { question: string; answer: string; }, index: number) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent className="prose prose-invert max-w-none">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <p className="text-xs text-muted-foreground mt-4 text-right">
                  FAQs generated by AI
                </p>
              </CardContent>
            </Card>
          )}

          {/* Edit Page Button */}
          <div className="text-center">
            <Link
              href={{
                pathname: '/contribute',
                query: {
                  target_table: 'episodes',
                  target_id: episode.id,
                },
              }}
              passHref
            >
              <Button variant="outline">
                Edit Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="sticky top-24 space-y-8">
            <PodcastPlayer />
            
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-2">
                    {computedRatingCount > 0 ? (
                      <StarRating
                        rating={computedAverageRating}
                        readOnly
                        showValue
                        size={16}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">No ratings yet</span>
                    )}
                    <span className="text-sm text-muted-foreground">({computedRatingCount})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="link-consistent-text">{formatNumber(episode.views)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="link-consistent-text">{formatNumber(episode.likes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="link-consistent-text">{formatDuration(episode.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span className="link-consistent-text">{formatDate(episode.published_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Podcast Info Card */}
            <Card>
              <CardHeader className="p-4">
                <Link href={`/podcasts/${episode.podcasts.slug || episode.podcasts.id}`}>
                  <Image
                    src={episode.podcasts.cover_image_url || 'https://placehold.co/400x400.png'}
                    alt={episode.podcasts.title}
                    width={400}
                    height={400}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </Link>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{episode.podcasts.title}</h2>
                  {episode.podcasts.is_verified && <VerifiedBadge className="h-5 w-5 flex-shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  From this podcast
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
