// "use server"; // Disabled for static export

import { supabaseServer } from "@/integrations/supabase/server-client";

export async function getContributionData(
  target_table: string,
  target_id: string
) {
  const supabase = await supabaseServer();
  let query = supabase.from(target_table).select("*").eq("id", target_id).single();

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching contribution data:", error);
    return null;
  }

  if (target_table === "podcasts") {
    // Fetch episodes
    const { data: episodes, error: episodesError } = await supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", target_id)
      .order("episode_number", { ascending: true });

    if (episodesError) {
      console.error("Error fetching episodes:", episodesError);
    } else {
      data.episodes = episodes;
    }

    // Fetch team members from podcast_people table
    const { data: teamMembers, error: teamError } = await supabase
      .from("podcast_people")
      .select(`
        role,
        people (
          id,
          full_name,
          bio,
          photo_urls,
          social_links,
          is_verified,
          slug
        )
      `)
      .eq("podcast_id", target_id);

    if (teamError) {
      console.error("Error fetching team members:", teamError);
    } else {
      // Transform the data to match the expected format
      data.team_members = teamMembers?.map((tm: any) => ({
        id: tm.people?.id,
        name: tm.people?.full_name,
        full_name: tm.people?.full_name,
        bio: tm.people?.bio,
        photo_urls: tm.people?.photo_urls,
        social_links: tm.people?.social_links,
        is_verified: tm.people?.is_verified,
        slug: tm.people?.slug,
        role: tm.role
      })) || [];
    }

    // Ensure language and location are properly set
    if (data.language && typeof data.language === 'string') {
      data.languages = [data.language];
    }
    if (data.location && typeof data.location === 'string') {
      data.podcastLocation = data.location;
    }
  }

  return data;
}

export async function getContributionById(contributionId: string) {
  const supabase = await supabaseServer();
  
  // Convert string ID to number since contributions table uses BIGINT
  const numericId = parseInt(contributionId, 10);
  
  if (isNaN(numericId)) {
    console.error("Invalid contribution ID:", contributionId);
    return null;
  }
  
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("id", numericId)
    .single();

  if (error) {
    console.error("Error fetching contribution:", error);
    return null;
  }

  // Fetch user profile separately since there's no direct relationship
  let userProfile = null;
  if (data.user_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, email, avatar_url")
      .eq("user_id", data.user_id)
      .single();
    
    if (!profileError && profileData) {
      userProfile = profileData;
    }
  }

  return {
    ...data,
    profiles: userProfile
  };
}