import { supabaseServer } from '@/integrations/supabase/server';
import { getFallbackEmailConfig, setFallbackEmailConfig } from './email-config-fallback';

export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  profile_picture?: string;
  is_active: boolean;
  // Incoming email configuration
  incoming_email_address?: string;
  incoming_email_enabled?: boolean;
  incoming_email_subject_prefix?: string;
}

let emailConfig: EmailConfig | null = null;

export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from('email_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching email config from database:', error);
      // Fallback to local storage
      const fallbackConfig = getFallbackEmailConfig();
      if (fallbackConfig) {
        emailConfig = fallbackConfig;
        return fallbackConfig;
      }
      return null;
    }

    emailConfig = data;
    return data;
  } catch (error) {
    console.error('Error fetching email config:', error);
    // Fallback to local storage
    const fallbackConfig = getFallbackEmailConfig();
    if (fallbackConfig) {
      emailConfig = fallbackConfig;
      return fallbackConfig;
    }
    return null;
  }
}

export async function updateEmailConfig(config: Partial<EmailConfig>): Promise<boolean> {
  try {
    const supabase = await supabaseServer();
    // First try to update existing record
    const { data: existing, error: fetchError } = await supabase
      .from('email_config')
      .select('id')
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing config:', fetchError);
      // Fallback to local storage
      setFallbackEmailConfig(config as EmailConfig);
      return true;
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('email_config')
        .update(config)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating email config in database:', error);
        // Fallback to local storage
        setFallbackEmailConfig(config as EmailConfig);
        return true;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('email_config')
        .insert([config]);

      if (error) {
        console.error('Error inserting email config in database:', error);
        // Fallback to local storage
        setFallbackEmailConfig(config as EmailConfig);
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating email config:', error);
    // Fallback to local storage
    setFallbackEmailConfig(config as EmailConfig);
    return true;
  }
}

export function getWelcomeEmailTemplate(userName: string, profilePicture?: string) {
  return {
    subject: 'Welcome to PodDB Pro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        ${profilePicture ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${profilePicture}" alt="PodDB Pro" style="max-width: 120px; height: auto; border-radius: 8px;" />
          </div>
        ` : ''}
        <h2 style="color: #333; text-align: center;">Welcome to PodDB Pro, ${userName}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for joining our community of podcast enthusiasts.</p>
        <p style="font-size: 16px; line-height: 1.6;">You can now:</p>
        <ul style="font-size: 16px; line-height: 1.6;">
          <li>Discover amazing podcasts</li>
          <li>Submit your own podcast</li>
          <li>Connect with other podcast lovers</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6;">Happy listening!</p>
        <p style="text-align: center; color: #666; font-size: 14px;">The PodDB Pro Team</p>
      </div>
    `,
    text: `Welcome to PodDB Pro, ${userName}! Thank you for joining our community.`
  };
}

export function getPasswordResetTemplate(resetUrl: string, profilePicture?: string) {
  return {
    subject: 'Reset Your PodDB Pro Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        ${profilePicture ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${profilePicture}" alt="PodDB Pro" style="max-width: 120px; height: auto; border-radius: 8px;" />
          </div>
        ` : ''}
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6;">You requested to reset your password. Click the link below to reset it:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">If you didn't request this, please ignore this email.</p>
        <p style="text-align: center; color: #666; font-size: 14px;">The PodDB Pro Team</p>
      </div>
    `,
    text: `Password Reset Request. Click this link to reset your password: ${resetUrl}`
  };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  emailType: string,
  notificationId?: string
): Promise<boolean> {
  try {
    // Get email config
    const config = await getEmailConfig();
    if (!config || !config.is_active) {
      console.error('Email service not configured or inactive');
      return false;
    }

    // Send email via API route
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    console.log('Sending email to:', `${baseUrl}/api/send-email`);
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    // Record the email notification
    if (notificationId) {
      const supabase = await supabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.rpc('send_email_notification', {
            p_user_id: user.id,
            p_notification_id: notificationId,
            p_email_type: emailType,
            p_subject: subject,
            p_content: html,
          });
        } catch (rpcError) {
          console.error('Error recording email notification:', rpcError);
          // Don't fail the main email send if recording fails
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
