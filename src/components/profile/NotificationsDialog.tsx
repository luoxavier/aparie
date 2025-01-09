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

export function NotificationsDialog() {
  const { user } = useAuth();

  const { data: pendingRequests } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          user_id,
          profiles!friend_connections_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingRequests && pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {pendingRequests?.length === 0 && (
            <p className="text-center text-muted-foreground">No new notifications</p>
          )}
          {pendingRequests?.map((request) => (
            <FriendRequestItem
              key={request.user_id}
              requesterId={request.user_id}
              requesterUsername={request.profiles.username}
              requesterAvatar={request.profiles.avatar_url}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}