import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: string;
  content?: {
    playlistName?: string;
    message?: string;
  };
  sender: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Separate notifications by type
  const actionNotifications = notifications.filter(n => 
    n.type === 'friend_request'
  );
  
  const updateNotifications = notifications.filter(n => 
    ['shared_playlist', 'new_public_playlist'].includes(n.type)
  );

  const handleRemoveAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notifications.map(n => n.id));

      if (error) throw error;

      toast({
        title: "Success",
        description: "All notifications have been marked as read.",
      });

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {notifications?.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRemoveAll}
          >
            Mark All as Read
          </Button>
        </div>
      )}

      {actionNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Action Required</h3>
          {actionNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              senderName={notification.sender.display_name}
              senderAvatar={notification.sender.avatar_url}
              type={notification.type}
              senderId={notification.sender.id}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}

      {updateNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Updates</h3>
          {updateNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              senderName={notification.sender.display_name}
              senderAvatar={notification.sender.avatar_url}
              type={notification.type}
              senderId={notification.sender.id}
              content={notification.content}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}

      {notifications.length === 0 && (
        <p className="text-center text-muted-foreground">No notifications</p>
      )}
    </div>
  );
}