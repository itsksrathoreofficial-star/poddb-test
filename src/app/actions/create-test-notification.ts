// "use server"; // Disabled for static export

import { supabaseServer } from '@/integrations/supabase/server-client';

export async function createTestNotification(userId: string) {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Test Notification 🧪',
        message: 'This is a test notification to verify the notifications system is working correctly.',
        type: 'system',
        target_url: '/notifications',
        metadata: { is_test: true, created_at: new Date().toISOString() }
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
