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
import { useCallback, useState } from "react";

interface NotificationContent {
  playlistName?: string;
  message?: string;
}

export function NotificationsDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

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
        
        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        if (!data) return [];

        return data.map(notification => ({
          ...notification,
          sender: {
            ...notification.sender,
            display_name: notification.sender?.username 
              ? `${notification.sender.display_name} (@${notification.sender.username})`
              : notification.sender?.display_name || 'Unknown User'
          },
          content: notification.content as NotificationContent
        }));
      } catch (error: any) {
        console.error('Error in notifications query:', error);
        // Check if it's an authentication error
        if (error.message?.includes('JWT')) {
          // Refresh the session
          const { data: session } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw error;
      }
    },
    enabled: !!user?.id && isOpen, // Only fetch when dialog is open
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
      
      await refetch();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, [user?.id, toast, refetch]);

  const totalNotifications = notifications?.length || 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refetch(); // Refresh notifications when dialog opens
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            View and manage your notifications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg" />
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

          {!isLoading && !isError && totalNotifications === 0 && (
            <p className="text-center text-muted-foreground">No new notifications</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}