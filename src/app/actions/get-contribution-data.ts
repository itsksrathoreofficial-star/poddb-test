"use server";

import { supabaseServer } from "@/integrations/supabase/server";

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
    const { data: episodes, error: episodesError } = await supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", target_id);

    if (episodesError) {
      console.error("Error fetching episodes:", episodesError);
    } else {
      data.episodes = episodes;
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