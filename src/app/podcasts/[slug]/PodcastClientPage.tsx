"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getPodcast } from '@/app/actions/podcasts';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Eye, Heart, Clock, Play, HelpCircle, Rss, Link as LinkIcon, Youtube, Twitter, Instagram, Facebook, Twitch, Linkedin, Globe, Image as ImageIcon } from 'lucide-react';
import { usePlayer } from '@/components/PlayerProvider';
import { StarRating } from '@/components/StarRating';
import AudioPlayer from '@/components/AudioPlayer';
import PodcastPlayer from '@/components/PodcastPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AwardsAndNominations } from '@/components/AwardsAndNominations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Tables } from '@/integrations/supabase/types';

type PodcastWithEpisodesAndReviews = Tables<'podcasts'> & {
  episodes: (Tables<'episodes'> & { slug?: string })[];
  reviews: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null })[];
  team_members: any[];
  language: string;
  location?: string;
  additional_images?: string[];
  category: string;
  social_links: { [key: string]: string };
  official_website: string | null;
  platform_links: { [key: string]: string };
};

interface PodcastClientPageProps {
  podcast: PodcastWithEpisodesAndReviews;
}

export default function PodcastClientPage({ podcast: initialPodcast }: PodcastClientPageProps) {
  const [podcast, setPodcast] = useState(initialPodcast);
  const [visibleEpisodes, setVisibleEpisodes] = useState(15);
  const [visibleReviews, setVisibleReviews] = useState(10);
  const [visibleTeam, setVisibleTeam] = useState(10);
  const { play, currentTrack, isPlaying, pause, loadTrack } = usePlayer();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // Compute average_rating and rating_count from valid reviews
  const validReviews = (podcast.reviews || []).filter(
    (review): review is Tables<'reviews'> & { profiles: Tables<'profiles'> | null } =>
      review != null && typeof review.rating === 'number'
  );
  const computedRatingCount = validReviews.length;
  const computedAverageRating = computedRatingCount > 0
    ? validReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / computedRatingCount
    : 0;

  // Debug reviews and podcast on mount
  useEffect(() => {
    console.log('Initial podcast reviews:', podcast.reviews);
    console.log('Initial podcast:', podcast);
    if (podcast.episodes && podcast.episodes.length > 0) {
      const latestEpisode = podcast.episodes[0];
      const playlist = podcast.episodes.map(e => ({
        id: e.id,
        title: e.title,
        youtube_video_id: e.youtube_video_id!,
        coverImage: e.thumbnail_url || podcast.cover_image_url || '',
        podcastTitle: podcast.title,
      }));
      loadTrack(playlist[0], playlist);
    }
  }, []);

  // Refresh podcast data on mount to ensure latest ratings
  useEffect(() => {
    async function refreshPodcast() {
      try {
        const updatedPodcast = await getPodcast(slug);
        setPodcast(updatedPodcast);
        console.log('Refreshed podcast data:', updatedPodcast);
      } catch (error) {
        console.error('Error refreshing podcast data on mount:', error);
      }
    }
    // Only attempt refresh if slug exists
    if (slug) {
      refreshPodcast();
    }
  }, [slug]);

  const handleReviewSubmit = async (newReview: Tables<'reviews'> & { profiles: Tables<'profiles'> | null } | undefined) => {
    console.log('New review submitted:', newReview);
    // Validate newReview
    if (!newReview || typeof newReview.rating !== 'number') {
      console.error('Invalid review data:', newReview);
      return;
    }
    try {
      // Attempt to fetch updated podcast data
      if (!slug) {
        throw new Error('No slug available for podcast');
      }
      const updatedPodcast = await getPodcast(slug);
      setPodcast(updatedPodcast);
      console.log('Updated podcast after review:', updatedPodcast);
    } catch (error) {
      console.error('Error in handleReviewSubmit:', error);
      // Fallback: Update reviews array client-side
      setPodcast(prev => {
        const existingReviewIndex = prev.reviews.findIndex(r => r.id === newReview.id);
        if (existingReviewIndex > -1) {
          const updatedReviews = [...prev.reviews];
          updatedReviews[existingReviewIndex] = newReview;
          return { ...prev, reviews: updatedReviews };
        } else {
          return { ...prev, reviews: [...(prev.reviews || []), newReview] };
        }
      });
    }
  };

  const handlePlay = (episode: Tables<'episodes'>) => {
    const playlist = podcast.episodes.map(e => ({
      id: e.id,
      title: e.title,
      youtube_video_id: e.youtube_video_id!,
      coverImage: e.thumbnail_url || podcast.cover_image_url || '',
      podcastTitle: podcast.title,
    }));
    if (currentTrack && currentTrack.id === episode.id && isPlaying) {
      pause();
    } else {
      play(playlist.find(t => t.id === episode.id)!, playlist);
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const seoData = podcast.seo_metadata as any;

  // Debug average rating
  console.log('Average Rating:', podcast.average_rating, 'Rating Count:', podcast.rating_count);
  console.log('Computed Average Rating:', computedAverageRating, 'Computed Rating Count:', computedRatingCount);

  return (
    <div className="min-h-screen">
      <header className="relative h-[40vh] min-h-[300px]">
        <Image src={podcast.cover_image_url || '/placeholder.svg'} alt={podcast.title || 'Podcast'} layout="fill" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-lg"/>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Image src={podcast.cover_image_url || '/placeholder.svg'} alt={podcast.title || 'Podcast'} width={192} height={192} className="w-48 h-48 rounded-lg object-cover shadow-2xl flex-shrink-0 -mb-12 md:-mb-0"/>
            <div className="text-center md:text-left">
                             <div className="flex items-center gap-2">
                 <h1 className="text-4xl md:text-6xl font-bold">{podcast.title}</h1>
                 {podcast.is_verified && (
                   <VerifiedBadge className="h-8 w-8" />
                 )}
               </div>
                              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                 {Array.isArray(podcast.categories) ? (
                   podcast.categories.map((cat: string) => (
                     <Link key={cat} href={`/categories?name=${encodeURIComponent(cat)}`}>
                       <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                         {cat}
                       </Badge>
                     </Link>
                   ))
                 ) : (
                   <Link href={`/categories?name=${encodeURIComponent(podcast.category)}`}>
                     <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                       {podcast.category}
                     </Badge>
                   </Link>
                 )}
               </div>
               
               
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative max-h-48 overflow-y-auto">
                  <p className="whitespace-pre-wrap">
                    {podcast.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Images Section */}
            {podcast.additional_images && podcast.additional_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ImageIcon className="h-6 w-6" />
                    Additional Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {podcast.additional_images.map((imageUrl, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <Image 
                          src={imageUrl} 
                          alt={`${podcast.title} - Image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="episodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="episodes">Episodes ({podcast.episodes?.length || 0})</TabsTrigger>
          <TabsTrigger value="team">Team ({podcast.team_members?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="episodes" className="mt-6">
          <div className="space-y-3 max-h-[1000px] overflow-y-auto">
            {podcast.episodes?.slice(0, visibleEpisodes).map((episode) => (
              <Link href={`/episodes/${episode.slug || episode.id}`} key={episode.id} className="contents">
                  <Card className="group cursor-pointer card-hover bg-card border-border">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <Image
                          src={episode.thumbnail_url || 'https://placehold.co/100x100.png'}
                          alt={episode.title}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {episode.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(episode.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{formatNumber(episode.likes)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{Math.floor(episode.duration / 60)} min</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlay(episode);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                    </CardContent>
                  </Card>
              </Link>
            ))}
            {podcast.episodes && podcast.episodes.length > visibleEpisodes && (
              <Button variant="outline" onClick={() => setVisibleEpisodes(prev => prev + 10)}>
                Show More
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
            {Array.isArray(podcast.team_members) && (podcast.team_members as any[]).slice(0, visibleTeam).map((member: any) => (
              <Link key={member.id} href={`/people/${member.slug || member.person_slug || member.id}`}>
                <Card className="group cursor-pointer card-hover">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <img src={member.photo_urls?.[0]} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
            {Array.isArray(podcast.team_members) && podcast.team_members.length > visibleTeam && (
              <Button variant="outline" onClick={() => setVisibleTeam(prev => prev + 10)} className="mt-4">
                Show More
              </Button>
            )}
        </TabsContent>
      </Tabs>

      {/* Reviews Section - Added below episodes for better visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({podcast.reviews?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">Reviews ({podcast.reviews?.length || 0})</TabsTrigger>
              <TabsTrigger value="write-review">Write a Review</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <ReviewsList reviews={podcast.reviews?.slice(0, visibleReviews) || []} />
                {podcast.reviews && podcast.reviews.length > visibleReviews && (
                  <Button variant="outline" onClick={() => setVisibleReviews(prev => prev + 10)}>
                    Show More
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="write-review" className="mt-6">
              <ReviewForm targetId={podcast.id} targetTable="podcasts" onReviewSubmit={handleReviewSubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Generated FAQs */}
      {Array.isArray(seoData?.faqs) && seoData.faqs.length > 0 && (
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
          </div>
          <div className="space-y-8">
            <div className="sticky top-24 space-y-8">
              <PodcastPlayer />
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
                          rating={typeof podcast.average_rating === 'number' ? podcast.average_rating : computedAverageRating}
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
                    <span className="link-consistent-text">{formatNumber(podcast.total_views)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="link-consistent-text">{formatNumber(podcast.total_likes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Episodes</span>
                    <span className="link-consistent-text">{podcast.total_episodes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <Link href={`/languages/${encodeURIComponent(podcast.language)}`}>
                      <span className="link-consistent-text cursor-pointer hover:text-primary transition-colors">{podcast.language}</span>
                    </Link>
                  </div>
                  {podcast.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <Link href={`/locations/${encodeURIComponent(podcast.location)}`}>
                        <span className="link-consistent-text cursor-pointer hover:text-primary transition-colors">{podcast.location}</span>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
                             {podcast.official_website && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Official Website</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <Link href={podcast.official_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all flex items-center gap-2">
                       <Globe className="h-5 w-5" />
                       <span>{podcast.official_website}</span>
                     </Link>
                   </CardContent>
                 </Card>
               )}
               
                               {/* Social Links Card */}
                {podcast.social_links && Object.keys(podcast.social_links).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {getAllSocialLinks(podcast.social_links)}
                      </div>
                    </CardContent>
                  </Card>
                )}
               
                               <Card>
                  <CardHeader>
                    <CardTitle>Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                                             {podcast.platform_links && typeof podcast.platform_links === 'object' && Object.entries(podcast.platform_links).map(([platform, url]) => (
                         <Link 
                           key={platform} 
                           href={url as string} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="link-consistent"
                           title={`Visit ${platform}`}
                         >
                           {getPlatformIcon(platform)}
                           <span className="link-consistent-text">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                         </Link>
                       ))}
                    </div>
                  </CardContent>
                </Card>

              <AwardsAndNominations
                targetId={podcast.id}
                targetType="podcast"
                targetName={podcast.title}
                targetImageUrl={podcast.cover_image_url || ''}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href={{
              pathname: '/contribute',
              query: {
                target_table: 'podcasts',
                target_id: podcast.id,
              },
            }}
            passHref
          >
            <Button variant="outline">
              Edit Page
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <Youtube className="h-5 w-5" />;
    case 'twitter':
      return <Twitter className="h-5 w-5" />;
    case 'instagram':
      return <Instagram className="h-5 w-5" />;
    case 'facebook':
      return <Facebook className="h-5 w-5" />;
    case 'twitch':
      return <Twitch className="h-5 w-5" />;
    case 'linkedin':
      return <Linkedin className="h-5 w-5" />;
    default:
      return <LinkIcon className="h-5 w-5" />;
  }
};

const getPlatformIcon = (platform: string) => {
  // Add platform specific icons here
  return <Rss className="h-5 w-5" />;
};

// Helper function to get all social media links in correct sequence
const getAllSocialLinks = (socialLinks: { [key: string]: string }) => {
  const platformSequence = ['youtube', 'instagram', 'facebook', 'twitter', 'linkedin', 'threads', 'pinterest'];
  
  // First, get platforms in the correct sequence
  const orderedLinks = platformSequence
    .filter(platform => socialLinks[platform])
    .map(platform => (
      <Link 
        key={platform} 
        href={socialLinks[platform]} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="link-consistent"
        title={`Follow us on ${platform}`}
      >
        {getSocialIcon(platform)}
        <span className="link-consistent-text">{platform === 'twitter' ? 'X' : platform}</span>
      </Link>
    ));
  
  // Then, get any other platforms not in the sequence
  const otherLinks = Object.entries(socialLinks)
    .filter(([platform]) => !platformSequence.includes(platform))
    .map(([platform, url]) => (
      <Link 
        key={platform} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="link-consistent"
        title={`Follow us on ${platform}`}
      >
        {getSocialIcon(platform)}
        <span className="link-consistent-text">{platform}</span>
      </Link>
    ));
  
  return [...orderedLinks, ...otherLinks];
};
