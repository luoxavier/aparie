import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: string;
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
    <div className="space-y-4">
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
      {notifications?.map((notification) => (
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
  );
}