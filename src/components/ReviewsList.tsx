
"use client";

import React, { useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Loader2, Edit, Trash } from 'lucide-react';
import { StarRating } from './StarRating';
import { voteOnReview, deleteReview } from '@/app/actions/reviews';
import { toast } from './ui/sonner';
import { useAuth } from './AuthProvider';

interface Review {
  id: string;
  user_id: string;
  rating: number | null;
  review_title: string | null;
  review_text: string | null;
  created_at: string | null;
  upvotes: number | null;
  downvotes: number | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  fake_user_name?: string | null;
  fake_user_avatar?: string | null;
  fake_user_email?: string | null;
  is_fake_review?: boolean | null;
}

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleVote = (reviewId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('You must be logged in to vote.');
      return;
    }
    startTransition(async () => {
      const result = await voteOnReview(reviewId, voteType, pathname);
      if (result.success) {
        toast.success('Your vote has been recorded!');
      } else {
        toast.error('Failed to record your vote.', { description: result.error });
      }
    });
  };

  const handleEdit = (reviewId: string) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality is not yet implemented.');
  };

  const handleDelete = (reviewId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a review.');
      return;
    }
    startTransition(async () => {
      const result = await deleteReview(reviewId, pathname);
      if (result.success) {
        toast.success('Your review has been deleted.');
      } else {
        toast.error('Failed to delete your review.', { description: result.error });
      }
    });
  };

  if (!reviews || reviews.length === 0) {
    return <p className="text-muted-foreground mt-4">No reviews yet. Be the first to write one!</p>;
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        // Determine which user info to display
        const displayName = review.is_fake_review 
          ? review.fake_user_name 
          : review.profiles?.display_name;
        const avatarUrl = review.is_fake_review 
          ? review.fake_user_avatar 
          : review.profiles?.avatar_url;
        
        return (
          <Card key={review.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    {displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{displayName || 'Anonymous'}</h3>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                  <div className="flex items-center gap-4">
                    <StarRating rating={review.rating || 0} size={16} readOnly />
                    <h4 className="text-lg font-bold">{review.review_title}</h4>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {review.review_text}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Was this review helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleVote(review.id, 'upvote')}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4"/>}
                    {review.upvotes ?? 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleVote(review.id, 'downvote')}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4"/>}
                    {review.downvotes ?? 0}
                  </Button>
                  {user && user.id === review.user_id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleEdit(review.id)}
                        disabled={isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDelete(review.id)}
                        disabled={isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
