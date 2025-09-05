"use server";

import { supabaseServer } from '@/integrations/supabase/server';

export async function createTestNotification(userId: string) {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: 'Test Notification 🧪',
      p_message: 'This is a test notification to verify the notifications system is working correctly.',
      p_type: 'system',
      p_target_url: '/notifications',
      p_metadata: { is_test: true, created_at: new Date().toISOString() }
    });

    if (error) {
      console.error('Error creating test notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, notificationId: data, error: null };
  } catch (error: any) {
    console.error('Error in createTestNotification:', error);
    return { success: false, error: error.message };
  }
}
