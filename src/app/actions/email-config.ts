"use server";

import { supabaseServer } from "@/integrations/supabase/server";
import { EmailConfig } from "@/lib/email-service-simple";
import { getFallbackEmailConfig, setFallbackEmailConfig } from "@/lib/email-config-fallback";

export async function getEmailConfig(): Promise<EmailConfig | null> {
  const supabase = await supabaseServer();
  
  try {
    // First try to get the most recent configuration (regardless of active status)
    const { data, error } = await supabase
      .from('email_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching email config from database:', error);
      // Fallback to local storage
      const fallbackConfig = getFallbackEmailConfig();
      console.log('Using fallback email config:', fallbackConfig);
      return fallbackConfig;
    }

    console.log('Using database email config:', data);
    return data;
  } catch (error) {
    console.error('Error fetching email config:', error);
    // Fallback to local storage
    const fallbackConfig = getFallbackEmailConfig();
    console.log('Using fallback email config (catch):', fallbackConfig);
    return fallbackConfig;
  }
}

export async function updateEmailConfig(config: EmailConfig): Promise<boolean> {
  const supabase = await supabaseServer();
  
  try {
    // First, deactivate all existing configurations
    const { error: deactivateError } = await supabase
      .from('email_config')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (deactivateError) {
      console.warn('Warning: Could not deactivate existing configs:', deactivateError);
    }

    // Check if any config exists (regardless of active status)
    const { data: existingConfig } = await supabase
      .from('email_config')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existingConfig) {
      // Update the most recent config
      const updateData = {
        smtp_host: config.smtp_host,
        smtp_port: config.smtp_port,
        smtp_username: config.smtp_username,
        smtp_password: config.smtp_password,
        from_email: config.from_email,
        from_name: config.from_name,
        profile_picture: config.profile_picture,
        is_active: true,
        // Incoming email fields
        incoming_email_address: config.incoming_email_address || null,
        incoming_email_enabled: config.incoming_email_enabled || false,
        incoming_email_subject_prefix: config.incoming_email_subject_prefix || '[Contact Form]',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('email_config')
        .update(updateData)
        .eq('id', existingConfig.id);

      if (error) {
        console.error('Error updating email config in database:', error);
        // Fallback to local storage
        setFallbackEmailConfig(config);
        console.log('Saved email config to fallback storage');
        return true;
      }
    } else {
      // Insert new config
      const insertData = {
        smtp_host: config.smtp_host,
        smtp_port: config.smtp_port,
        smtp_username: config.smtp_username,
        smtp_password: config.smtp_password,
        from_email: config.from_email,
        from_name: config.from_name,
        profile_picture: config.profile_picture,
        is_active: true,
        // Incoming email fields
        incoming_email_address: config.incoming_email_address || null,
        incoming_email_enabled: config.incoming_email_enabled || false,
        incoming_email_subject_prefix: config.incoming_email_subject_prefix || '[Contact Form]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('email_config')
        .insert([insertData]);

      if (error) {
        console.error('Error inserting email config in database:', error);
        // Fallback to local storage
        setFallbackEmailConfig(config);
        console.log('Saved email config to fallback storage');
        return true;
      }
    }

    console.log('Saved email config to database successfully');
    return true;
  } catch (error) {
    console.error('Error updating email config:', error);
    // Fallback to local storage
    setFallbackEmailConfig(config);
    console.log('Saved email config to fallback storage (catch)');
    return true;
  }
}

export async function sendTestEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  const supabase = await supabaseServer();
  
  try {
    const config = await getEmailConfig();
    if (!config) {
      console.error('No email configuration found');
      return false;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
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
      const errorData = await response.json();
      console.error('Error sending test email:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}
