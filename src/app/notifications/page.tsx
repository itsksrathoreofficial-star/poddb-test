"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications-client';
import { createTestNotification } from '@/app/actions/create-test-notification';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Loader2, 
  ExternalLink,
  User,
  Podcast,
  Clapperboard,
  Users,
  Shield,
  Newspaper,
  AlertCircle,
  Clock
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target_table?: string;
  target_id?: string;
  target_url?: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      router.push('/auth');
    }
  }, [user, router]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user.id);
      
      const result = await fetchUserNotifications(user.id);
      console.log('Notifications fetch result:', result);

      if (result.error) {
        console.error('Notifications fetch error:', result.error);
        // If table doesn't exist or permission denied, show empty state instead of error
        if (result.error.includes('relation "notifications" does not exist') ||
            result.error.includes('permission denied for table')) {
          console.log('Notifications table access issue, showing empty state');
          setNotifications([]);
          return;
        }
        toast.error("Error fetching notifications", {
          description: result.error,
        });
        return;
      }
      
      setNotifications(result.data || []);
      console.log('Notifications set:', result.data?.length || 0);
    } catch (error: any) {
      console.error('Notifications fetch error details:', error);
      toast.error("Error fetching notifications", {
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      setMarkingAsRead(notificationId);
      console.log('Marking notification as read:', notificationId);
      
      const result = await markNotificationAsRead(notificationId);
      console.log('Mark as read result:', result);
      
      if (result.error) {
        console.error('Mark as read error:', result.error);
        toast.error("Error marking notification as read", {
          description: result.error,
        });
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      toast.success("Notification marked as read");
    } catch (error: any) {
      console.error('Mark as read error details:', error);
      toast.error("Error marking notification as read", {
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      console.log('Marking all notifications as read for user:', user.id);
      
      const result = await markAllNotificationsAsRead(user.id);
      console.log('Mark all as read result:', result);
      
      if (result.error) {
        console.error('Mark all as read error:', result.error);
        toast.error("Error marking all notifications as read", {
          description: result.error,
        });
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      toast.success("All notifications marked as read");
    } catch (error: any) {
      console.error('Mark all as read error details:', error);
      toast.error("Error marking all notifications as read", {
        description: error.message || 'An unknown error occurred.',
      });
    }
  };

  const createTestNotificationHandler = async () => {
    if (!user) return;
    try {
      setCreatingTest(true);
      const result = await createTestNotification(user.id);
      
      if (result.error) {
        toast.error("Error creating test notification", {
          description: result.error,
        });
        return;
      }
      
      toast.success("Test notification created successfully!");
      // Refresh notifications
      await fetchNotifications();
    } catch (error: any) {
      toast.error("Error creating test notification", {
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setCreatingTest(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <Podcast className="h-5 w-5" />;
      case 'approval':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'rejection':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'verification':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'news':
        return <Newspaper className="h-5 w-5 text-purple-600" />;
      case 'admin':
        return <User className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'approval':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejection':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'verification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'news':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'admin':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to target URL if available
    if (notification.target_url) {
      router.push(notification.target_url);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect hook will redirect
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your activity and important updates
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark All Notifications as Read</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark all {unreadCount} unread notifications as read. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={markAllAsRead}>
                    Mark All Read
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={createTestNotificationHandler}
            disabled={creatingTest}
          >
            {creatingTest ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            Create Test
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getNotificationTypeColor(notification.type)}`}
                      >
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          disabled={markingAsRead === notification.id}
                          className="h-6 px-2 text-xs"
                        >
                          {markingAsRead === notification.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {notification.target_url && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You'll receive notifications for your contributions, approvals, and important updates.
            </p>
            <Button asChild>
              <Link href="/contribute">Start Contributing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
