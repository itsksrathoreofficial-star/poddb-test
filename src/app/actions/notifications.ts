// "use server"; // Disabled for static export

import { supabaseServer } from '@/integrations/supabase/server-client';
import { sendEmail, getWelcomeEmailTemplate, getPasswordResetTemplate, getEmailConfig } from '@/lib/email-service-simple';
// import { revalidatePath } from 'next/cache'; // Disabled for static export - use client-side refresh instead

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'contribution' | 'approval' | 'rejection' | 'system' | 'admin' | 'verification' | 'news',
  targetTable?: string,
  targetId?: string,
  targetUrl?: string,
  metadata?: any
) {
  const supabase = await supabaseServer();
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        target_table: targetTable,
        target_id: targetId,
        target_url: targetUrl,
        metadata: metadata,
      });

    if (error) throw error;

    // Send email notification
    const notificationId = (data as any)?.[0]?.id || null;
    await sendEmailNotification(userId, notificationId || '', type, title, message);

    return { success: true, notificationId };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendEmailNotification(
  userId: string,
  notificationId: string,
  type: string,
  title: string,
  message: string
) {
  const supabase = await supabaseServer();
  
  try {
    // Get user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'User profile not found' };
    }

    // Get email template based on type
    let template;
    switch (type) {
      case 'approval':
        template = getWelcomeEmailTemplate(
          `Contribution Approved: ${title}`,
          `Your contribution "${title}" has been approved and is now live on PodDB Pro!`
        );
        break;
      case 'rejection':
        template = getWelcomeEmailTemplate(
          `Contribution Rejected: ${title}`,
          `Your contribution "${title}" has been reviewed but was not approved. Please check the feedback and try again.`
        );
        break;
      case 'system':
        template = {
          subject: title,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1>${title}</h1><p>${message}</p></div>`,
          text: `${title}: ${message}`,
        };
        break;
      default:
        template = {
          subject: title,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1>${title}</h1><p>${message}</p></div>`,
          text: `${title}: ${message}`,
        };
    }

    // Send email
    const emailSent = await sendEmail(
      profile.email,
      template.subject,
      template.html,
      template.text,
      type,
      notificationId
    );

    return { success: emailSent };
  } catch (error: any) {
    console.error('Error sending email notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(userId: string) {
  const supabase = await supabaseServer();
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'User profile not found' };
    }

    // Get email config for profile picture
    const emailConfig = await getEmailConfig();
    const template = getWelcomeEmailTemplate(
      profile.display_name || 'User',
      emailConfig?.profile_picture
    );
    
    const emailSent = await sendEmail(
      profile.email,
      template.subject,
      template.html,
      template.text,
      'welcome'
    );

    return { success: emailSent };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    // Get email config for profile picture
    const emailConfig = await getEmailConfig();
    const template = getPasswordResetTemplate(resetUrl, emailConfig?.profile_picture);
    
    const emailSent = await sendEmail(
      email,
      template.subject,
      template.html,
      template.text,
      'password_reset'
    );

    return { success: emailSent };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAdminAnnouncement(
  userIds: string[],
  title: string,
  message: string
) {
  const supabase = await supabaseServer();
  
  try {
    const results = [];
    
    for (const userId of userIds) {
      // Create notification
      const notificationResult = await createNotification(
        userId,
        title,
        message,
        'admin',
        undefined,
        undefined,
        undefined,
        { isAnnouncement: true }
      );

      results.push({ userId, ...notificationResult });
    }

    return { success: true, results };
  } catch (error: any) {
    console.error('Error sending admin announcement:', error);
    return { success: false, error: error.message };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    } as any);

    if (error) throw error;

     // revalidatePath('/notifications'); // Disabled for static export - use client-side refresh instead
    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.rpc('mark_all_notifications_read', {
      p_user_id: userId,
    } as any);

    if (error) throw error;

     // revalidatePath('/notifications'); // Disabled for static export - use client-side refresh instead
    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
}
