import { supabaseServer } from '@/integrations/supabase/server';
import { getFallbackEmailConfig, setFallbackEmailConfig } from './email-config-fallback';

export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

export class EmailService {
  private config: EmailConfig | null = null;

  async getEmailConfig(): Promise<EmailConfig | null> {
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
          this.config = fallbackConfig;
          return fallbackConfig;
        }
        return null;
      }

      this.config = data;
      return data;
    } catch (error) {
      console.error('Error fetching email config:', error);
      // Fallback to local storage
      const fallbackConfig = getFallbackEmailConfig();
      if (fallbackConfig) {
        this.config = fallbackConfig;
        return fallbackConfig;
      }
      return null;
    }
  }

  async updateEmailConfig(config: Partial<EmailConfig>): Promise<boolean> {
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

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    emailType: string,
    notificationId?: string
  ): Promise<boolean> {
    try {
      // Get email config
      const config = await this.getEmailConfig();
      if (!config || !config.is_active) {
        console.error('Email service not configured or inactive');
        return false;
      }

      // Send email via API route
      // For server-side calls, we need to construct the URL properly
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
}

// Export a singleton instance
export const emailService = new EmailService();