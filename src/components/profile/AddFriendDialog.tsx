import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function AddFriendDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [friendId, setFriendId] = useState("");

  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      try {
        // Check for existing friend connection in both directions
        const { data: existingConnection, error: checkError } = await supabase
          .from('friend_connections')
          .select('*')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingConnection) {
          if (existingConnection.status === 'accepted') {
            toast({
              title: "Already friends",
              description: "You are already friends with this user.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Friend request pending",
              description: "There is already a pending friend request between you and this user.",
              variant: "destructive",
            });
          }
          return;
        }

        const { error: insertError } = await supabase
          .from('friend_connections')
          .insert([
            {
              user_id: user?.id,
              friend_id: friendId,
              status: 'pending'
            }
          ]);

        if (insertError) {
          if (insertError.code === '23505') {
            toast({
              title: "Friend request already exists",
              description: "You already have a pending or accepted friend request with this user.",
              variant: "destructive",
            });
            return;
          }
          throw insertError;
        }

        // Create a notification for the friend request
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              recipient_id: friendId,
              sender_id: user?.id,
              type: 'friend_request',
              content: null
            }
          ]);

        if (notificationError) throw notificationError;

        toast({
          title: "Success",
          description: "Friend request sent successfully!",
        });
      } catch (error: any) {
        console.error('Error in friend request process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Friend</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          placeholder="Enter friend's ID"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          className="border p-2 rounded"
        />
        <Button
          onClick={() => {
            if (friendId) {
              sendFriendRequest.mutate(friendId);
              setFriendId("");
            }
          }}
        >
          Send Friend Request
        </Button>
      </DialogContent>
    </Dialog>
  );
}
