// "use server"; // Disabled for static export

import { supabaseServer } from "@/integrations/supabase/server-client";
// import { revalidatePath } from "next/cache"; // Disabled for static export - use client-side refresh instead

export async function createPreviewUpdateAction(
  targetTable: string,
  targetId: string,
  data: any,
  changes: any
): Promise<{ success: boolean; error?: string; previewId?: string }> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to create preview updates." };
  }

  try {
    // Create a preview update record
    const { data: previewData, error } = await supabase
      .from("preview_updates")
      .insert([
        {
          user_id: user.id,
          target_table: targetTable,
          target_id: targetId,
          original_data: data,
          updated_data: changes,
          status: 'pending',
          created_at: new Date().toISOString()
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating preview update:", error);
      return { success: false, error: error.message };
    }

    // revalidatePath("/admin"); // Disabled for static export - use client-side refresh instead
    return { success: true, previewId: previewData.id };
  } catch (error: any) {
    console.error("Error creating preview update:", error);
    return { success: false, error: error.message };
  }
}

export async function getPreviewUpdateAction(
  previewId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("preview_updates")
      .select("*")
      .eq("id", previewId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approvePreviewUpdateAction(
  previewId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();

  try {
    // Get the preview update
    const { data: previewData, error: fetchError } = await supabase
      .from("preview_updates")
      .select("*")
      .eq("id", previewId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Handle team members separately for podcasts
    if (previewData.target_table === 'podcasts' && previewData.updated_data.team_members) {
      const { team_members, ...podcastData } = previewData.updated_data;
      
      // Update the podcast data without team_members
      const { error: updateError } = await supabase
        .from(previewData.target_table)
        .update(podcastData)
        .eq("id", previewData.target_id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Handle team members
      if (team_members && team_members.length > 0) {
        // First, remove existing team members
        const { error: deleteError } = await supabase
          .from('podcast_people')
          .delete()
          .eq('podcast_id', previewData.target_id);

        if (deleteError) {
          console.error('Error deleting existing team members:', deleteError);
          // Continue anyway, as this might not be critical
        }

        // Add new team members
        for (const member of team_members) {
          if (member.name) {
            // Find or create the person
            let { data: person, error: personError } = await supabase
              .from('people')
              .select('id')
              .eq('full_name', member.name)
              .single();

            if (personError && personError.code !== 'PGRST116') { // 'PGRST116' is "No rows found"
              console.error('Error finding person:', personError);
              continue; // Skip to next member
            }

            if (!person) {
              const { data: newPerson, error: newPersonError } = await supabase
                .from('people')
                .insert({
                  full_name: member.name,
                  bio: member.bio || '',
                  photo_urls: member.photo_urls || [],
                  social_links: member.social_links || {},
                  is_verified: false,
                  slug: member.name.toLowerCase().replace(/\s+/g, '-'),
                })
                .select('id')
                .single();
              
              if (newPersonError) {
                console.error('Error creating person:', newPersonError);
                continue;
              }
              person = newPerson;
            }

            // Link person to podcast with role
            if (person) {
              const roles = Array.isArray(member.role) ? member.role : [member.role || 'Guest'];
              
              for (const role of roles) {
                const { error: linkError } = await supabase
                  .from('podcast_people')
                  .insert({
                    podcast_id: previewData.target_id,
                    person_id: person.id,
                    role: role,
                  });

                if (linkError) {
                  console.error('Error linking person to podcast with role:', linkError);
                }
              }
            }
          }
        }
      }
    } else {
      // For non-podcast tables or podcasts without team members, update normally
      const { error: updateError } = await supabase
        .from(previewData.target_table)
        .update(previewData.updated_data)
        .eq("id", previewData.target_id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    }

    // Mark preview as approved
    const { error: statusError } = await supabase
      .from("preview_updates")
      .update({ 
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq("id", previewId);

    if (statusError) {
      return { success: false, error: statusError.message };
    }

     // revalidatePath("/admin"); // Disabled for static export - use client-side refresh instead
     // revalidatePath(`/admin-preview/${previewId}`); // Disabled for static export - use client-side refresh instead
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectPreviewUpdateAction(
  previewId: string,
  reason: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();

  try {
    const { error } = await supabase
      .from("preview_updates")
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        rejected_by: adminId,
        rejected_at: new Date().toISOString()
      })
      .eq("id", previewId);

    if (error) {
      return { success: false, error: error.message };
    }

     // revalidatePath("/admin"); // Disabled for static export - use client-side refresh instead
     // revalidatePath(`/admin-preview/${previewId}`); // Disabled for static export - use client-side refresh instead
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
