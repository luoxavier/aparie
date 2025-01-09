import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function NotificationsDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch pending friend requests
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

  // Handle friend request response
  const handleFriendRequest = useMutation({
    mutationFn: async ({ requesterId, action }: { requesterId: string, action: 'accept' | 'deny' }) => {
      if (action === 'accept') {
        const { error } = await supabase
          .from('friend_connections')
          .update({ status: 'accepted' })
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friend_connections')
          .delete()
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'accept' ? "Friend request accepted" : "Friend request denied",
        description: variables.action === 'accept' 
          ? "You are now friends!" 
          : "The friend request has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error handling friend request",
        description: error.message,
        variant: "destructive",
      });
    }
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
            <div key={request.user_id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {request.profiles.avatar_url && (
                  <img
                    src={request.profiles.avatar_url}
                    alt={request.profiles.username}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{request.profiles.username}</p>
                  <p className="text-sm text-muted-foreground">Sent you a friend request</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleFriendRequest.mutate({ requesterId: request.user_id, action: 'accept' })}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleFriendRequest.mutate({ requesterId: request.user_id, action: 'deny' })}
                >
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}