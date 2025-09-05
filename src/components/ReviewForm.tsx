
"use client";

import React, { useState, useTransition } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { StarRating } from './StarRating';
import { toast } from './ui/sonner';
import { submitReview } from '@/app/actions/reviews';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { Tables } from '@/integrations/supabase/types';

interface ReviewFormProps {
  targetId: string;
  targetTable: 'podcasts' | 'episodes' | 'people';
  onReviewSubmit?: (review: Tables<'reviews'> & { profiles: Tables<'profiles'> | null }) => void;
}

export function ReviewForm({ targetId, targetTable, onReviewSubmit }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a review.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    if (!reviewTitle.trim()) {
      toast.error('Please enter a review title.');
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        targetId,
        targetTable,
        rating,
        reviewTitle,
        reviewText,
        isSpoiler: false, // Feature for later
        pathname,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error('Failed to submit review.', { description: result.error });
      }
    });
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You must be <a href="/auth" className="text-primary underline">logged in</a> to write a review.</p>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your review has been submitted and is pending approval. Our team will verify it within 48 hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Write Your Review</CardTitle>
        <CardDescription>Share your thoughts with the community.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="space-y-2">
            <label htmlFor="review-title" className="font-medium">Review Title</label>
            <Input
              id="review-title"
              placeholder="A short, catchy title for your review"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="review-text" className="font-medium">Your Review</label>
            <Textarea
              id="review-text"
              placeholder="What did you think? Write a detailed review."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="hero" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
