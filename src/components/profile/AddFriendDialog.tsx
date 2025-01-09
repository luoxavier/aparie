import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function AddFriendDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [friendIdentifier, setFriendIdentifier] = useState("");

  const sendFriendRequest = useMutation({
    mutationFn: async (friendIdentifier: string) => {
      try {
        // First, get the friend's UUID from their username
        const { data: friendProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', friendIdentifier)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            toast({
              title: "User not found",
              description: "No user found with that username.",
              variant: "destructive",
            });
            return;
          }
          throw profileError;
        }

        if (!friendProfile) {
          toast({
            title: "User not found",
            description: "No user found with that username.",
            variant: "destructive",
          });
          return;
        }

        const friendId = friendProfile.id;

        // Check if trying to add self
        if (friendId === user?.id) {
          toast({
            title: "Invalid request",
            description: "You cannot add yourself as a friend.",
            variant: "destructive",
          });
          return;
        }

        // Check for existing friend connection
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

        // Send friend request
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

        // Create notification
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
        toast({
          title: "Error",
          description: "Failed to send friend request. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setFriendIdentifier("");
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
          <DialogDescription>
            Enter your friend's username to send them a friend request.
          </DialogDescription>
        </DialogHeader>
        <input
          type="text"
          placeholder="Enter friend's username"
          value={friendIdentifier}
          onChange={(e) => setFriendIdentifier(e.target.value)}
          className="border p-2 rounded"
        />
        <Button
          onClick={() => {
            if (friendIdentifier) {
              sendFriendRequest.mutate(friendIdentifier);
            }
          }}
        >
          Send Friend Request
        </Button>
      </DialogContent>
    </Dialog>
  );
}