import { EmailConfig } from './email-service-simple';

// Fallback email configuration when database is not accessible
// This will be used temporarily until the database permissions are fixed

let fallbackConfig: EmailConfig | null = null;

export const getFallbackEmailConfig = (): EmailConfig | null => {
  // Try to load from localStorage first if not already loaded
  if (!fallbackConfig && typeof window !== 'undefined') {
    const stored = localStorage.getItem('email_config');
    if (stored) {
      try {
        fallbackConfig = JSON.parse(stored);
        console.log('Loaded email config from localStorage fallback');
      } catch (error) {
        console.error('Error parsing stored email config from localStorage:', error);
        localStorage.removeItem('email_config'); // Remove corrupted data
      }
    }
  }
  return fallbackConfig;
};

export const setFallbackEmailConfig = (config: EmailConfig): void => {
  // Ensure all incoming email fields are properly set
  const fullConfig = {
    ...config,
    incoming_email_address: config.incoming_email_address || '',
    incoming_email_enabled: config.incoming_email_enabled || false,
    incoming_email_subject_prefix: config.incoming_email_subject_prefix || '[Contact Form]',
  };
  
  fallbackConfig = fullConfig;
  // Also store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('email_config', JSON.stringify(fullConfig));
      console.log('Saved email config to localStorage fallback:', fullConfig);
    } catch (error) {
      console.error('Error saving email config to localStorage:', error);
    }
  }
};

export const loadFallbackEmailConfig = (): EmailConfig | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('email_config');
    if (stored) {
      try {
        const parsedConfig = JSON.parse(stored);
        // Ensure all incoming email fields are properly set
        const fullConfig = {
          ...parsedConfig,
          incoming_email_address: parsedConfig.incoming_email_address || '',
          incoming_email_enabled: parsedConfig.incoming_email_enabled || false,
          incoming_email_subject_prefix: parsedConfig.incoming_email_subject_prefix || '[Contact Form]',
        };
        fallbackConfig = fullConfig;
        console.log('Loaded email config from localStorage:', fullConfig);
        return fullConfig;
      } catch (error) {
        console.error('Error parsing stored email config:', error);
        localStorage.removeItem('email_config'); // Remove corrupted data
      }
    }
  }
  return null;
};

export const clearFallbackEmailConfig = (): void => {
  fallbackConfig = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('email_config');
    console.log('Cleared email config from localStorage fallback');
  }
};
