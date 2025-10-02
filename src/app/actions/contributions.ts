// "use server"; // Disabled for static export

import { supabaseServer } from "@/integrations/supabase/server-client";
// import { revalidatePath } from "next/cache"; // Disabled for static export - use client-side refresh instead

type ContributionData = {
  target_table: 'podcasts' | 'people';
  target_id: string;
  data: any;
};

export async function createContributionAction(
  contributionData: ContributionData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to contribute." };
  }

  const { error } = await supabase.from("contributions").insert([
    {
      user_id: user.id,
      target_table: contributionData.target_table,
      target_id: contributionData.target_id,
      data: contributionData.data,
    },
  ]);

  if (error) {
    console.error("Error creating contribution:", error);
    return { success: false, error: error.message };
  }

  // Also add to contribution history (only for podcasts and people)
  if (contributionData.target_table === 'podcasts' || contributionData.target_table === 'people') {
    try {
      const { error: historyError } = await supabase.rpc('add_contribution_to_history', {
        p_user_id: user.id,
        p_contribution_type: contributionData.target_table.slice(0, -1), // Remove 's' from end
        p_target_table: contributionData.target_table,
        p_target_id: contributionData.target_id,
        p_target_title: contributionData.data.title || contributionData.data.full_name || 'Contribution',
        p_target_slug: contributionData.data.slug || null,
        p_target_image_url: contributionData.data.cover_image_url || contributionData.data.photo_urls?.[0] || null,
        p_status: 'pending',
        p_metadata: contributionData.data
      } as any);

      if (historyError) {
        console.error("Error adding to contribution history:", historyError);
        // Don't fail the main operation if history fails
      }
    } catch (historyError) {
      console.error("Error adding to contribution history:", historyError);
      // Don't fail the main operation if history fails
    }
  }

   // revalidatePath("/"); // Disabled for static export - use client-side refresh instead
  return { success: true };
}
