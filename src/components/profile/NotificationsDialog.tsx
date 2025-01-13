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

export function NotificationsDialog() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
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
        .eq('recipient_id', user?.id)
        .eq('read', false)
        .neq('sender_id', user?.id) // Filter out self-notifications
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(notification => ({
        ...notification,
        sender: {
          ...notification.sender,
          display_name: notification.sender.username 
            ? `${notification.sender.display_name} (@${notification.sender.username})`
            : notification.sender.display_name
        },
        content: notification.content ? {
          playlistName: notification.content.playlistName,
          message: notification.content.message
        } : undefined
      }));
    },
  });

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const totalNotifications = notifications?.length || 0;

  return (
    <Dialog>
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
          {notifications && notifications.length > 0 && (
            <NotificationsList 
              notifications={notifications}
              onMarkAsRead={markAsRead}
            />
          )}

          {totalNotifications === 0 && (
            <p className="text-center text-muted-foreground">No new notifications</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}