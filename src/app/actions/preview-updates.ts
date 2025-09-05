"use server";

import { supabaseServer } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/admin");
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

    // Update the target table with the new data
    const { error: updateError } = await supabase
      .from(previewData.target_table)
      .update(previewData.updated_data)
      .eq("id", previewData.target_id);

    if (updateError) {
      return { success: false, error: updateError.message };
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

    revalidatePath("/admin");
    revalidatePath(`/preview-updates/${previewId}`);
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

    revalidatePath("/admin");
    revalidatePath(`/preview-updates/${previewId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
