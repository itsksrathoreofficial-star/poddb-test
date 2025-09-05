"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorNotification {
  id: string;
  error_log_id: string;
  admin_user_id: string;
  notification_type: 'new_error' | 'error_update' | 'error_resolved';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  error_log?: {
    error_id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    error_type: string;
    page_url: string;
  };
}

interface ErrorNotificationContextType {
  notifications: ErrorNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextType | null>(null);

export function useErrorNotifications() {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotifications must be used within ErrorNotificationProvider');
  }
  return context;
}

interface ErrorNotificationProviderProps {
  children: React.ReactNode;
}

export function ErrorNotificationProvider({ children }: ErrorNotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin((profile as any)?.role === 'admin');
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  // Fetch notifications for admin users
  useEffect(() => {
    if (isAdmin && user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [isAdmin, user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('error_notifications')
        .select(`
          *,
          error_logs (
            error_id,
            title,
            severity,
            error_type,
            page_url
          )
        `)
        .eq('admin_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Failed to fetch error notifications:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('error_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'error_notifications',
          filter: `admin_user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as ErrorNotification;
          
          // Fetch the error log details
          fetchErrorLogDetails(newNotification.error_log_id).then(errorLog => {
            const notificationWithDetails = {
              ...newNotification,
              error_log: errorLog
            };
            
            setNotifications(prev => [notificationWithDetails as any, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            showErrorToast(notificationWithDetails as any);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchErrorLogDetails = async (errorLogId: string) => {
    try {
      const { data } = await supabase
        .from('error_logs')
        .select('error_id, title, severity, error_type, page_url')
        .eq('id', errorLogId)
        .single();
      
      return data;
    } catch (error) {
      console.error('Failed to fetch error log details:', error);
      return null;
    }
  };

  const showErrorToast = (notification: ErrorNotification) => {
    const severityColors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };

    const severityColor = severityColors[notification.error_log?.severity || 'medium'];

    toast.error(
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full ${severityColor} mt-2 flex-shrink-0`} />
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {notification.error_log?.title || 'New Error'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {notification.error_log?.error_type?.toUpperCase()} • {notification.error_log?.severity?.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {notification.error_log?.page_url}
          </div>
        </div>
      </div>,
      {
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to admin error tracking page
            window.open('/admin?tab=error_tracking', '_blank');
          }
        }
      }
    );
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('error_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        } as any)
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('error_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        } as any)
        .eq('admin_user_id', user?.id as any)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      const { error } = await supabase
        .from('error_notifications')
        .delete()
        .eq('admin_user_id', user?.id as any);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const value: ErrorNotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <ErrorNotificationContext.Provider value={value}>
      {children}
      {isAdmin && unreadCount > 0 && (
        <ErrorNotificationBadge count={unreadCount} />
      )}
    </ErrorNotificationContext.Provider>
  );
}

interface ErrorNotificationBadgeProps {
  count: number;
}

function ErrorNotificationBadge({ count }: ErrorNotificationBadgeProps) {
  const { markAllAsRead } = useErrorNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-sm">New Errors</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm">
            {count} new error{count !== 1 ? 's' : ''} detected. Click to view details.
          </CardDescription>
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => window.open('/admin?tab=error_tracking', '_blank')}
          >
            View Error Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
