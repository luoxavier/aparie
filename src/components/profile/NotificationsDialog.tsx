import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FriendRequestItem } from "./FriendRequestItem";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
            display_name,
            avatar_url
          )
        `)
        .eq('recipient_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          user_id,
          profiles!friend_connections_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('friend_id', user?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
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

  const totalNotifications = (notifications?.length || 0) + (pendingRequests?.length || 0);

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
        </DialogHeader>
        <div className="space-y-4">
          {pendingRequests?.map((request) => (
            <FriendRequestItem
              key={request.user_id}
              requesterId={request.user_id}
              requesterDisplayName={request.profiles.display_name}
              requesterAvatar={request.profiles.avatar_url}
            />
          ))}
          
          {notifications?.map((notification) => (
            <Card key={notification.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {notification.sender.avatar_url && (
                    <img
                      src={notification.sender.avatar_url}
                      alt={notification.sender.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{notification.sender.display_name}</p>
                    {notification.type === 'new_flashcard' && (
                      <p className="text-sm text-gray-600">
                        Created a new flashcard for you
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalNotifications === 0 && (
            <p className="text-center text-muted-foreground">No new notifications</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}