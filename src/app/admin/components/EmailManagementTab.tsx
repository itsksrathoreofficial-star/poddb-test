"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmailConfig } from '@/lib/email-service';
import { getEmailConfig, updateEmailConfig, sendTestEmail } from '@/app/actions/email-config';
import { loadFallbackEmailConfig } from '@/lib/email-config-fallback';
import { sendAdminAnnouncement } from '@/app/actions/notifications';
import { 
  Mail, 
  Settings, 
  Send, 
  Users, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  TestTube,
  Save,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EmailManagementTabProps {
  users: any[];
  isPending: boolean;
  startTransition: (callback: () => void) => void;
}

export default function EmailManagementTab({ users, isPending, startTransition }: EmailManagementTabProps) {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactSubmissions, setContactSubmissions] = useState<any[] | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Email config form state
  const [configForm, setConfigForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: 'PodDB Pro',
    profile_picture: '',
    is_active: false,
    // Incoming email configuration
    incoming_email_address: '',
    incoming_email_enabled: false,
    incoming_email_subject_prefix: '[Contact Form]',
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    recipientType: 'all', // 'all', 'specific'
    specificUsers: [] as string[],
  });

  useEffect(() => {
    fetchEmailConfig();
    fetchContactSubmissions();
  }, []);

  // Also try to load from localStorage on component mount as a backup
  useEffect(() => {
    if (!emailConfig && typeof window !== 'undefined') {
      const stored = localStorage.getItem('email_config');
      if (stored) {
        try {
          const parsedConfig = JSON.parse(stored);
          if (parsedConfig && !emailConfig) {
            setEmailConfig(parsedConfig);
            setConfigForm({
              smtp_host: parsedConfig.smtp_host || '',
              smtp_port: parsedConfig.smtp_port || 587,
              smtp_username: parsedConfig.smtp_username || '',
              smtp_password: parsedConfig.smtp_password || '',
              from_email: parsedConfig.from_email || '',
              from_name: parsedConfig.from_name || 'PodDB Pro',
              profile_picture: parsedConfig.profile_picture || '',
              is_active: parsedConfig.is_active || false,
              incoming_email_address: parsedConfig.incoming_email_address || '',
              incoming_email_enabled: parsedConfig.incoming_email_enabled || false,
              incoming_email_subject_prefix: parsedConfig.incoming_email_subject_prefix || '[Contact Form]',
            });
            console.log('Loaded email config from localStorage on mount');
          }
        } catch (error) {
          console.error('Error parsing stored email config on mount:', error);
        }
      }
    }
  }, [emailConfig]);

  const fetchContactSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || 
            error.message?.includes('relation "contact_submissions" does not exist') ||
            error.message?.includes('does not exist')) {
          console.log('Contact submissions table not found - this is expected if migration hasn\'t been applied yet');
          setContactSubmissions(null);
          return;
        }
        
        // For other errors, log but don't show toast
        console.warn('Error fetching contact submissions:', error);
        setContactSubmissions([]);
      } else {
        setContactSubmissions(data || []);
      }
    } catch (error) {
      // Handle any other errors gracefully
      console.warn('Error fetching contact submissions:', error);
      setContactSubmissions(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      console.log('Fetching email config...');
      const config = await getEmailConfig();
      console.log('Received email config:', config);
      
      if (config) {
        setEmailConfig(config);
        setConfigForm({
          smtp_host: config.smtp_host || '',
          smtp_port: config.smtp_port || 587,
          smtp_username: config.smtp_username || '',
          smtp_password: config.smtp_password || '',
          from_email: config.from_email || '',
          from_name: config.from_name || 'PodDB Pro',
          profile_picture: config.profile_picture || '',
          is_active: config.is_active || false,
          incoming_email_address: config.incoming_email_address || '',
          incoming_email_enabled: config.incoming_email_enabled || false,
          incoming_email_subject_prefix: config.incoming_email_subject_prefix || '[Contact Form]',
        });
        console.log('Set email config from server action');
        toast.success("Email configuration loaded successfully");
      } else {
        // Try to load from fallback
        console.log('No config from server, trying fallback...');
        const fallbackConfig = loadFallbackEmailConfig();
        console.log('Fallback config:', fallbackConfig);
        
        if (fallbackConfig) {
          setEmailConfig(fallbackConfig);
          setConfigForm({
            smtp_host: fallbackConfig.smtp_host || '',
            smtp_port: fallbackConfig.smtp_port || 587,
            smtp_username: fallbackConfig.smtp_username || '',
            smtp_password: fallbackConfig.smtp_password || '',
            from_email: fallbackConfig.from_email || '',
            from_name: fallbackConfig.from_name || 'PodDB Pro',
            profile_picture: fallbackConfig.profile_picture || '',
            is_active: fallbackConfig.is_active || false,
            incoming_email_address: fallbackConfig.incoming_email_address || '',
            incoming_email_enabled: fallbackConfig.incoming_email_enabled || false,
            incoming_email_subject_prefix: fallbackConfig.incoming_email_subject_prefix || '[Contact Form]',
          });
          console.log('Set email config from fallback');
          toast.info("Email configuration loaded from local storage");
        } else {
          // If no config exists, keep the default values
          setEmailConfig(null);
          console.log('No email config found anywhere');
          toast.info("No email configuration found. Please configure your email settings.");
        }
      }
    } catch (error: any) {
      console.error('Error fetching email configuration:', error);
      toast.error("Error fetching email configuration", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEmailConfig = async () => {
    // Validate required fields
    if (!configForm.smtp_host || !configForm.smtp_username || !configForm.from_email) {
      toast.error("Please fill in all required fields (SMTP Host, Username, and From Email)");
      return;
    }

    if (!configForm.smtp_port || configForm.smtp_port < 1 || configForm.smtp_port > 65535) {
      toast.error("Please enter a valid SMTP port (1-65535)");
      return;
    }

    try {
      setSaving(true);
      console.log('Saving email configuration:', configForm);
      const success = await updateEmailConfig(configForm);
      if (success) {
        toast.success("Email configuration saved successfully");
        // Refresh the configuration to ensure it's properly loaded
        await fetchEmailConfig();
      } else {
        toast.error("Failed to save email configuration");
      }
    } catch (error: any) {
      console.error('Error saving email configuration:', error);
      toast.error("Error saving email configuration", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfig = async () => {
    try {
      setTesting(true);
      
      // Get a different email for testing (not the same as from_email)
      const testEmail = prompt("Enter email address to send test email to:", "kiranbanna012@gmail.com");
      
      if (!testEmail) {
        toast.error("Test email cancelled");
        return;
      }

      const template = {
        subject: 'PodDB Pro Email Test - ' + new Date().toLocaleString(),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            ${configForm.profile_picture ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${configForm.profile_picture}" alt="${configForm.from_name}" style="max-width: 100px; height: auto; border-radius: 8px;" />
              </div>
            ` : ''}
            <h1 style="color: #333; text-align: center;">✅ Email Configuration Test</h1>
            <p style="font-size: 16px; line-height: 1.6;">This is a test email to verify your email configuration is working correctly.</p>
            <p style="font-size: 16px; line-height: 1.6;">If you received this email, your configuration is set up properly!</p>
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Test Details:</p>
              <p style="margin: 5px 0;">From: ${configForm.from_email}</p>
              <p style="margin: 5px 0;">To: ${testEmail}</p>
              <p style="margin: 5px 0;">Time: ${new Date().toLocaleString()}</p>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">The ${configForm.from_name} Team</p>
          </div>
        `,
        text: `Email Configuration Test - ${new Date().toLocaleString()}\n\nThis is a test email to verify your email configuration is working correctly.\n\nIf you received this email, your configuration is set up properly!\n\nTest Details:\nFrom: ${configForm.from_email}\nTo: ${testEmail}\nTime: ${new Date().toLocaleString()}\n\nThe PodDB Pro Team`,
      };

      const success = await sendTestEmail(
        testEmail,
        template.subject,
        template.html,
        template.text
      );

      if (success) {
        toast.success(`Test email sent successfully to ${testEmail}`);
      } else {
        toast.error("Failed to send test email");
      }
    } catch (error: any) {
      toast.error("Error sending test email", {
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSending(true);
      
      let userIds: string[] = [];
      if (announcementForm.recipientType === 'all') {
        userIds = users.map(user => user.user_id);
      } else {
        userIds = announcementForm.specificUsers;
      }

      if (userIds.length === 0) {
        toast.error("No recipients selected");
        return;
      }

      const result = await sendAdminAnnouncement(
        userIds,
        announcementForm.title,
        announcementForm.message
      );

      if (result.success) {
        toast.success(`Announcement sent to ${userIds.length} users`);
        setAnnouncementForm({
          title: '',
          message: '',
          recipientType: 'all',
          specificUsers: [],
        });
      } else {
        toast.error("Failed to send announcement", {
          description: result.error,
        });
      }
    } catch (error: any) {
      toast.error("Error sending announcement", {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for sending emails to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host *</Label>
              <Input
                id="smtp_host"
                value={configForm.smtp_host}
                onChange={(e) => setConfigForm(prev => ({ ...prev, smtp_host: e.target.value }))}
                placeholder="smtp.gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                value={configForm.smtp_port || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const port = value === '' ? 587 : parseInt(value) || 587;
                  setConfigForm(prev => ({ ...prev, smtp_port: port }));
                }}
                placeholder="587"
              />
              <p className="text-xs text-muted-foreground">
                Use 465 for SSL/TLS or 587 for STARTTLS
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_username">SMTP Username *</Label>
              <Input
                id="smtp_username"
                value={configForm.smtp_username}
                onChange={(e) => setConfigForm(prev => ({ ...prev, smtp_username: e.target.value }))}
                placeholder="your-email@gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_password">SMTP Password</Label>
              <Input
                id="smtp_password"
                type="password"
                value={configForm.smtp_password}
                onChange={(e) => setConfigForm(prev => ({ ...prev, smtp_password: e.target.value }))}
                placeholder="Your app password"
              />
              <p className="text-xs text-muted-foreground">
                For Gmail, use an App Password instead of your regular password
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_email">From Email *</Label>
              <Input
                id="from_email"
                value={configForm.from_email}
                onChange={(e) => setConfigForm(prev => ({ ...prev, from_email: e.target.value }))}
                placeholder="noreply@poddb.pro"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_name">From Name</Label>
              <Input
                id="from_name"
                value={configForm.from_name}
                onChange={(e) => setConfigForm(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="PodDB Pro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_picture">Profile Picture URL</Label>
              <Input
                id="profile_picture"
                value={configForm.profile_picture}
                onChange={(e) => setConfigForm(prev => ({ ...prev, profile_picture: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Optional: URL of your logo/profile picture to display in emails
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📧 Email Sender Profile Picture</h4>
              <p className="text-sm text-blue-800 mb-3">
                To show your profile picture in email clients (Gmail, Outlook, etc.), you have these options:
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <span className="font-medium">1. Gravatar:</span>
                  <span>Upload your picture at <a href="https://gravatar.com" target="_blank" className="underline">gravatar.com</a> using your email address</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">2. Google Workspace:</span>
                  <span>Use a Google Workspace email with profile picture set in Google account</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">3. Microsoft 365:</span>
                  <span>Use a Microsoft 365 email with profile picture set in Microsoft account</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={configForm.is_active}
              onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Enable email service</Label>
          </div>

                     <div className="flex gap-2">
             <Button onClick={saveEmailConfig} disabled={saving}>
               {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               Save Configuration
             </Button>
             <Button variant="outline" onClick={testEmailConfig} disabled={testing || !configForm.is_active}>
               {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
               Test Email
             </Button>
             <Button variant="outline" onClick={fetchEmailConfig}>
               <RefreshCw className="mr-2 h-4 w-4" />
               Refresh
             </Button>
             <Button variant="outline" onClick={() => {
               console.log('Current config form:', configForm);
               console.log('Current email config:', emailConfig);
               toast.info("Configuration details logged to console");
             }}>
               Debug Config
             </Button>
           </div>
           
           <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
             <div className="flex items-center gap-2">
               <AlertCircle className="h-4 w-4 text-blue-600" />
               <span className="text-sm text-blue-800">
                 <strong>For your cPanel email:</strong> Use port 465 with SSL/TLS. Make sure your email password is correct and the email account exists in cPanel.
               </span>
             </div>
           </div>

          {emailConfig && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Configuration Status:</span>
                {emailConfig.is_active ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date((emailConfig as any).updated_at || Date.now()).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Incoming Email Configuration
          </CardTitle>
          <CardDescription>
            Configure where contact form submissions should be sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incoming_email_address">Incoming Email Address</Label>
              <Input
                id="incoming_email_address"
                value={configForm.incoming_email_address}
                onChange={(e) => setConfigForm(prev => ({ ...prev, incoming_email_address: e.target.value }))}
                placeholder="contact@poddb.pro"
                type="email"
              />
              <p className="text-xs text-muted-foreground">
                Email address where contact form submissions will be sent
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incoming_email_subject_prefix">Subject Prefix</Label>
              <Input
                id="incoming_email_subject_prefix"
                value={configForm.incoming_email_subject_prefix}
                onChange={(e) => setConfigForm(prev => ({ ...prev, incoming_email_subject_prefix: e.target.value }))}
                placeholder="[Contact Form]"
              />
              <p className="text-xs text-muted-foreground">
                Prefix to add to contact form email subjects (e.g., [Contact Form] Your Subject)
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="incoming_email_enabled"
                checked={configForm.incoming_email_enabled}
                onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, incoming_email_enabled: checked }))}
              />
              <Label htmlFor="incoming_email_enabled">Enable incoming email notifications</Label>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>Note:</strong> When enabled, all contact form submissions from your website will be sent to the configured email address.
              </span>
            </div>
          </div>

          {configForm.incoming_email_enabled && configForm.incoming_email_address && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  <strong>Incoming emails enabled:</strong> Contact forms will send emails to {configForm.incoming_email_address}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Announcement
          </CardTitle>
          <CardDescription>
            Send announcements or updates to all users or specific users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement_title">Title *</Label>
            <Input
              id="announcement_title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Important Update"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement_message">Message *</Label>
            <Textarea
              id="announcement_message"
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your announcement here..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Recipients</Label>
            <Select
              value={announcementForm.recipientType}
              onValueChange={(value) => setAnnouncementForm(prev => ({ ...prev, recipientType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users ({users.length})</SelectItem>
                <SelectItem value="specific">Specific Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {announcementForm.recipientType === 'specific' && (
            <div className="space-y-2">
              <Label>Select Users</Label>
              <Select
                onValueChange={(value) => {
                  if (!announcementForm.specificUsers.includes(value)) {
                    setAnnouncementForm(prev => ({
                      ...prev,
                      specificUsers: [...prev.specificUsers, value]
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select users to add..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.display_name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {announcementForm.specificUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Users ({announcementForm.specificUsers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {announcementForm.specificUsers.map(userId => {
                      const user = users.find(u => u.user_id === userId);
                      return (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user?.display_name || user?.email}
                          <button
                            onClick={() => setAnnouncementForm(prev => ({
                              ...prev,
                              specificUsers: prev.specificUsers.filter(id => id !== userId)
                            }))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={sending || !configForm.is_active}>
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Announcement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Send Announcement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to send this announcement to{' '}
                  {announcementForm.recipientType === 'all' 
                    ? `all ${users.length} users` 
                    : `${announcementForm.specificUsers.length} selected users`
                  }?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={sendAnnouncement}>
                  Send Announcement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {!configForm.is_active && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Email service is disabled. Please enable it in the configuration above to send announcements.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Statistics
          </CardTitle>
          <CardDescription>
            Overview of email notifications sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {emailConfig?.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-muted-foreground">Email Service</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Emails Sent Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Form Submissions
          </CardTitle>
          <CardDescription>
            View and manage contact form submissions from your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubmissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (contactSubmissions?.length || 0) === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {contactSubmissions === null ? (
                  <div className="space-y-2">
                    <p>Contact submissions table not available</p>
                    <p className="text-sm">This feature requires the database migration to be applied.</p>
                    <p className="text-sm">Contact forms will still work and send emails, but submissions won&apos;t be stored in the database yet.</p>
                  </div>
                ) : (
                  "No contact form submissions yet"
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {contactSubmissions?.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{submission.name}</span>
                        <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{submission.email}</p>
                      <p className="font-medium">{submission.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-muted p-3 rounded text-sm">
                    {submission.message}
                  </div>
                  {submission.admin_notes && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong>Admin Notes:</strong> {submission.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
