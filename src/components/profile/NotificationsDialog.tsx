import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { NotificationsList } from "./NotificationsList";
import { useCallback, useState, useEffect } from "react";

interface NotificationContent {
  playlistName?: string;
  message?: string;
}

export function NotificationsDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { refetch: refetchCount } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false)
          .neq('sender_id', user.id);
        
        if (error) throw error;
        
        setUnreadCount(count || 0);
        return count || 0;
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });

  const { data: notifications, refetch, isError, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            sender:profiles!notifications_sender_id_fkey (
              id,
              display_name,
              username,
              avatar_url
            )
          `)
          .eq('recipient_id', user.id)
          .eq('read', false)
          .neq('sender_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        return data?.map(notification => ({
          ...notification,
          sender: {
            ...notification.sender,
            display_name: notification.sender?.display_name || 'Unknown User'
          },
          content: notification.content as NotificationContent
        })) || [];
      } catch (error: any) {
        console.error('Error in notifications query:', error);
        if (error.message?.includes('JWT')) {
          const { data: session } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw error;
      }
    },
    enabled: !!user?.id && isOpen,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Notification change received:', payload);
          
          await refetchCount();
          
          if (isOpen) {
            await refetch();
          }
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as any;
            toast({
              title: "New Notification",
              description: newNotification.content?.message || "You have a new notification",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch, refetchCount, toast, isOpen]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      await Promise.all([refetch(), refetchCount()]);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, [user?.id, toast, refetch, refetchCount]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refetch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            View and manage your notifications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-16 bg-muted animate-pulse rounded-lg flex items-center p-4"
                >
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
                  <div className="ml-4 space-y-2 flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center space-y-4">
              <p className="text-red-500">
                Failed to load notifications
              </p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mx-auto"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !isError && notifications && notifications.length > 0 && (
            <NotificationsList 
              notifications={notifications}
              onMarkAsRead={markAsRead}
            />
          )}

          {!isLoading && !isError && notifications?.length === 0 && (
            <p className="text-center text-muted-foreground">No new notifications</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
