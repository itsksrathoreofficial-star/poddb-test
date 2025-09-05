
'use server';

import { supabaseServer } from '@/integrations/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/integrations/supabase/types';

interface SubmitReviewArgs {
  targetTable: 'podcasts' | 'episodes' | 'people';
  targetId: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  isSpoiler: boolean;
  pathname: string;
}

export async function submitReview(args: SubmitReviewArgs) {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to submit a review.');
    }

    // Manual upsert logic
    const { data: existingReview, error: selectError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_table', args.targetTable)
      .eq('target_id', args.targetId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Supabase select error:', selectError);
      throw new Error(selectError.message);
    }

    let reviewData: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null }) | null = null;

    if (existingReview) {
      // Update existing review
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: args.rating,
          review_title: args.reviewTitle,
          review_text: args.reviewText,
          is_spoiler: args.isSpoiler,
        })
        .eq('id', existingReview.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(updateError.message);
      }

      // Fetch profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Supabase profile fetch error:', profileError);
        throw new Error(profileError.message);
      }

      reviewData = data ? { ...data, profiles: profileData } : null;
    } else {
      // Insert new review
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          target_table: args.targetTable,
          target_id: args.targetId,
          rating: args.rating,
          review_title: args.reviewTitle,
          review_text: args.reviewText,
          is_spoiler: args.isSpoiler,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(insertError.message);
      }

      // Fetch profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Supabase profile fetch error:', profileError);
        throw new Error(profileError.message);
      }

      reviewData = data ? { ...data, profiles: profileData } : null;
    }

    if (!reviewData) {
      console.error('No review data returned from Supabase');
      throw new Error('Failed to retrieve review data.');
    }

    // Revalidate the page path to show the new review
    revalidatePath(args.pathname);

    return { success: true, review: reviewData };
  } catch (error: any) {
    console.error('Error in submitReview:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteReview(reviewId: string, pathname: string) {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete a review.');
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message);
    }

    revalidatePath(pathname);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function voteOnReview(reviewId: string, voteType: 'upvote' | 'downvote', pathname: string) {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to vote.');
    }

    const { error } = await supabase.rpc('vote_review', {
      review_id: reviewId,
      vote_type: voteType,
    } as any);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(error.message);
    }

    revalidatePath(pathname);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
