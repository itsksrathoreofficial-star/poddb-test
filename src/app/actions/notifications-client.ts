"use client";

import { supabase } from '@/integrations/supabase/client';

export async function fetchUserNotifications(userId: string) {
  try {
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Error in fetchUserNotifications:', error);
    return { data: [], error: error.message };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    
    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId
    } as any);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in markNotificationAsRead:', error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    
    const { data, error } = await supabase.rpc('mark_all_notifications_read', {
      p_user_id: userId
    } as any);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return { success: false, error: error.message };
  }
}
