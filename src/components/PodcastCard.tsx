import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Eye, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { VerifiedBadge } from './VerifiedBadge';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

interface PodcastCardProps {
  id: string;
  slug?: string | null;
  title: string;
  isVerified?: boolean;
  description: string;
  coverImage: string;
  totalEpisodes: number;
  totalViews: number;
  totalLikes: number;
  categories: string[];
  averageDuration: number;
  lastEpisodeDate: string;
  averageRating?: number;
  ratingCount?: number;
  simplified?: boolean;
}

export function PodcastCard({
  id,
  slug,
  title,
  description,
  coverImage,
  totalEpisodes,
  totalViews,
  totalLikes,
  categories,
  averageDuration,
  lastEpisodeDate,
  isVerified,
  averageRating,
  ratingCount,
  simplified = false,
}: PodcastCardProps) {

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const cardContent = (
    <Card
      className={cn('group overflow-hidden card-hover bg-card border-border cursor-pointer h-[480px] flex flex-col')}
    >
      <div className="relative aspect-square w-full overflow-hidden flex-shrink-0">
        <Image
          src={getSafeImageUrl(coverImage, '/placeholder.svg')}
          alt={title || 'Podcast'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="hero" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            View Podcast
          </Button>
        </div>
        {!simplified && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {totalEpisodes} episodes
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className={cn("p-4 flex flex-col", simplified ? "justify-between h-32" : "flex-grow")}>
        <div className={cn("space-y-2", simplified ? "flex flex-col justify-between h-full" : "flex flex-col flex-grow")}>
          <div className={simplified ? "flex-shrink-0" : "flex-grow"}>
            <div className="flex items-center gap-2 justify-center">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors h-12 flex items-center text-center overflow-hidden">
                <span className="truncate">
                  {title}
                </span>
              </h3>
              {isVerified && <VerifiedBadge className="h-5 w-5 flex-shrink-0" />}
            </div>
            {!simplified && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm justify-center h-5">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="font-semibold">{(averageRating ?? 0).toFixed(1)} / 10</span>
            <span className="text-muted-foreground">({ratingCount ?? 0} ratings)</span>
          </div>

          <div className="flex flex-wrap gap-1 justify-center h-6">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center h-5">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(totalViews)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(totalLikes)}</span>
            </div>
          </div>

          {!simplified && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/20">
              Latest: {new Date(lastEpisodeDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!slug || slug.trim() === '') {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toast.error("This podcast is not available.", {
            description: "The slug for this podcast could not be found.",
          });
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/podcasts/${slug}`} className="contents">
      {cardContent}
    </Link>
  );
}
