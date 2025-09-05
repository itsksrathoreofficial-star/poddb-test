'use server';

import { supabaseServer } from '@/integrations/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/integrations/supabase/types';

export interface FakeUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ScheduledReview {
  id: string;
  fake_user_id: string;
  target_table: 'podcasts' | 'episodes' | 'people';
  target_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  schedule_type: 'immediate' | 'random';
  scheduled_date?: string;
  random_days?: number;
  status: 'pending' | 'posted' | 'cancelled';
  created_at: string;
  updated_at: string;
  posted_at?: string;
  fake_user?: FakeUser;
  target_name?: string;
}

export interface CreateFakeUserData {
  display_name: string;
  avatar_url?: string;
  email?: string;
}

export interface CreateScheduledReviewData {
  fake_user_id: string;
  target_table: 'podcasts' | 'episodes' | 'people';
  target_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  schedule_type: 'immediate' | 'random';
  random_days?: number;
  scheduled_date?: string;
}

export interface TargetSuggestion {
  id: string;
  name: string;
  description?: string;
}

// Get all fake users
export async function getFakeUsers(): Promise<{ success: boolean; data?: FakeUser[]; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can access fake users.');
    }

    const { data, error } = await supabase
      .from('fake_users')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (error) throw error;

    return { success: true, data: data as FakeUser[] };
  } catch (error: any) {
    console.error('Error fetching fake users:', error);
    return { success: false, error: error.message };
  }
}

// Create a fake user
export async function createFakeUser(userData: CreateFakeUserData): Promise<{ success: boolean; data?: FakeUser; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can create fake users.');
    }

    const { data, error } = await supabase
      .from('fake_users')
      .insert({
        display_name: userData.display_name,
        avatar_url: userData.avatar_url,
        email: userData.email,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true, data: data as FakeUser };
  } catch (error: any) {
    console.error('Error creating fake user:', error);
    return { success: false, error: error.message };
  }
}

// Update a fake user
export async function updateFakeUser(id: string, userData: Partial<CreateFakeUserData>): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can update fake users.');
    }

    const { error } = await supabase
      .from('fake_users')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating fake user:', error);
    return { success: false, error: error.message };
  }
}

// Delete a fake user
export async function deleteFakeUser(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can delete fake users.');
    }

    const { error } = await supabase
      .from('fake_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting fake user:', error);
    return { success: false, error: error.message };
  }
}

// Get target suggestions for autocomplete
export async function getTargetSuggestions(
  targetTable: 'podcasts' | 'episodes' | 'people',
  searchTerm: string = ''
): Promise<{ success: boolean; data?: TargetSuggestion[]; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can access target suggestions.');
    }

    const { data, error } = await supabase.rpc('get_target_suggestions', {
      target_table_param: targetTable,
      search_term: searchTerm,
    } as any);

    if (error) throw error;

    return { success: true, data: data as TargetSuggestion[] };
  } catch (error: any) {
    console.error('Error fetching target suggestions:', error);
    return { success: false, error: error.message };
  }
}

// Create scheduled reviews
export async function createScheduledReviews(
  reviews: CreateScheduledReviewData[]
): Promise<{ success: boolean; data?: ScheduledReview[]; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can create scheduled reviews.');
    }

    // Validate reviews before inserting
    for (const review of reviews) {
      if (review.rating < 1 || review.rating > 10) {
        throw new Error(`Invalid rating: ${review.rating}. Rating must be between 1 and 10.`);
      }
      if (!review.fake_user_id) {
        throw new Error('Fake user ID is required');
      }
      if (!review.target_id) {
        throw new Error('Target ID is required');
      }
      if (!review.review_title?.trim()) {
        throw new Error('Review title is required');
      }
      if (!review.review_text?.trim()) {
        throw new Error('Review text is required');
      }
    }

    const { data, error } = await supabase
      .from('scheduled_reviews')
      .insert(reviews)
      .select()
      .order('created_at');

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    revalidatePath('/admin');
    return { success: true, data: data as ScheduledReview[] };
  } catch (error: any) {
    console.error('Error creating scheduled reviews:', error);
    return { success: false, error: error.message };
  }
}

// Get all scheduled reviews with details
export async function getScheduledReviews(): Promise<{ success: boolean; data?: ScheduledReview[]; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can access scheduled reviews.');
    }

    const { data, error } = await supabase
      .from('scheduled_reviews')
      .select(`
        *,
        fake_user:fake_users(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get target names for each review
    const reviewsWithTargetNames = await Promise.all(
      (data as any[]).map(async (review) => {
        let targetName = 'Unknown';
        
        try {
          if (review.target_table === 'podcasts') {
            const { data: podcast } = await supabase
              .from('podcasts')
              .select('title')
              .eq('id', review.target_id)
              .single();
            targetName = podcast?.title || 'Unknown Podcast';
          } else if (review.target_table === 'episodes') {
            const { data: episode } = await supabase
              .from('episodes')
              .select('title')
              .eq('id', review.target_id)
              .single();
            targetName = episode?.title || 'Unknown Episode';
          } else if (review.target_table === 'people') {
            const { data: person } = await supabase
              .from('people')
              .select('name')
              .eq('id', review.target_id)
              .single();
            targetName = person?.name || 'Unknown Person';
          }
        } catch (error) {
          console.error('Error fetching target name:', error);
        }

        return {
          ...review,
          target_name: targetName,
        };
      })
    );

    return { success: true, data: reviewsWithTargetNames as ScheduledReview[] };
  } catch (error: any) {
    console.error('Error fetching scheduled reviews:', error);
    return { success: false, error: error.message };
  }
}

// Update scheduled review
export async function updateScheduledReview(
  id: string,
  updates: Partial<ScheduledReview>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can update scheduled reviews.');
    }

    const { error } = await supabase
      .from('scheduled_reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating scheduled review:', error);
    return { success: false, error: error.message };
  }
}

// Cancel scheduled review
export async function cancelScheduledReview(id: string): Promise<{ success: boolean; error?: string }> {
  return updateScheduledReview(id, { status: 'cancelled' });
}

// Post scheduled review immediately
export async function postScheduledReview(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can post scheduled reviews.');
    }

    const { data, error } = await supabase.rpc('post_scheduled_review', {
      review_id: id,
    } as any);

    if (error) throw error;

    if (!data) {
      throw new Error('Failed to post scheduled review.');
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error posting scheduled review:', error);
    return { success: false, error: error.message };
  }
}

// Generate random schedule for reviews
export async function generateRandomSchedule(
  reviewIds: string[],
  daysCount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can generate random schedules.');
    }

    const { error } = await supabase.rpc('generate_random_schedule_dates', {
      review_ids: reviewIds,
      days_count: daysCount,
    } as any);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error generating random schedule:', error);
    return { success: false, error: error.message };
  }
}

// Create and post reviews immediately
export async function createAndPostReviewsImmediately(
  reviews: CreateScheduledReviewData[]
): Promise<{ success: boolean; data?: ScheduledReview[]; error?: string }> {
  const supabase = await supabaseServer();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can create and post reviews immediately.');
    }

    // Validate reviews before inserting
    for (const review of reviews) {
      if (review.rating < 1 || review.rating > 10) {
        throw new Error(`Invalid rating: ${review.rating}. Rating must be between 1 and 10.`);
      }
      if (!review.fake_user_id) {
        throw new Error('Fake user ID is required');
      }
      if (!review.target_id) {
        throw new Error('Target ID is required');
      }
      if (!review.review_title?.trim()) {
        throw new Error('Review title is required');
      }
      if (!review.review_text?.trim()) {
        throw new Error('Review text is required');
      }
    }

    // Create scheduled reviews first
    const { data: createdReviews, error: createError } = await supabase
      .from('scheduled_reviews')
      .insert(reviews.map(review => ({
        ...review,
        scheduled_date: new Date().toISOString(),
        status: 'pending'
      })))
      .select()
      .order('created_at');

    if (createError) {
      console.error('Database error:', createError);
      throw new Error(`Database error: ${createError.message}`);
    }

    // Now post each review immediately
    const postedReviews = [];
    for (const review of createdReviews || []) {
      const { data: success, error: postError } = await supabase.rpc('post_scheduled_review', {
        review_id: review.id
      } as any);

      if (postError) {
        console.error(`Error posting review ${review.id}:`, postError);
        // Continue with other reviews even if one fails
      } else if (success) {
        postedReviews.push(review);
      }
    }

    revalidatePath('/admin');
    return { success: true, data: postedReviews as ScheduledReview[] };
  } catch (error: any) {
    console.error('Error creating and posting reviews immediately:', error);
    return { success: false, error: error.message };
  }
}
