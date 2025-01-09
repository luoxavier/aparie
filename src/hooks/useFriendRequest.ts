import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [friendIdentifier, setFriendIdentifier] = useState("");

  const sendFriendRequest = useMutation({
    mutationFn: async (friendIdentifier: string) => {
      try {
        const { data: friendProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', friendIdentifier)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!friendProfile) {
          toast({
            title: "User not found",
            description: "No user found with that username.",
            variant: "destructive",
          });
          return;
        }

        const friendId = friendProfile.id;

        if (friendId === user?.id) {
          toast({
            title: "Invalid request",
            description: "You cannot add yourself as a friend.",
            variant: "destructive",
          });
          return;
        }

        const { data: existingConnection, error: checkError } = await supabase
          .from('friend_connections')
          .select('*')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`);

        if (checkError) throw checkError;

        if (existingConnection && existingConnection.length > 0) {
          const connection = existingConnection[0];
          if (connection.status === 'accepted') {
            toast({
              title: "Already friends",
              description: "You are already friends with this user.",
            });
            return;
          } else {
            toast({
              title: "Request pending",
              description: "A friend request is already pending with this user.",
            });
            return;
          }
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
              title: "Request exists",
              description: "A friend request already exists with this user.",
            });
            return;
          }
          throw insertError;
        }

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

  return {
    friendIdentifier,
    setFriendIdentifier,
    sendFriendRequest
  };
}