import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FriendRequestError {
  type: 'not_found' | 'self_request' | 'already_friends' | 'pending_request' | 'server_error';
  message: string;
}

export function useFriendRequest() {
  const [friendIdentifier, setFriendIdentifier] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const sendFriendRequest = useMutation({
    mutationFn: async (identifier: string) => {
      try {
        // Step 1: Find the user by identifier
        const { data: friendProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .maybeSingle();

        if (profileError) {
          throw new Error('Failed to search for user');
        }

        if (!friendProfile) {
          toast({
            title: "User not found",
            description: "No user found with that username.",
            variant: "destructive",
          });
          return;
        }

        // Step 2: Validate the request
        if (friendProfile.id === user?.id) {
          toast({
            title: "Invalid request",
            description: "You cannot send a friend request to yourself.",
            variant: "destructive",
          });
          return;
        }

        // Step 3: Check existing connections
        const { data: existingConnection, error: connectionError } = await supabase
          .from('friend_connections')
          .select('status')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${user?.id})`)
          .maybeSingle();

        if (connectionError) {
          throw new Error('Failed to check existing connections');
        }

        if (existingConnection) {
          const status = existingConnection.status;
          if (status === 'accepted') {
            toast({
              title: "Already friends",
              description: "You are already friends with this user.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Pending request",
              description: "A friend request is already pending.",
              variant: "destructive",
            });
          }
          return;
        }

        // Step 4: Create the friend request
        const { error: insertError } = await supabase
          .from('friend_connections')
          .insert([
            {
              user_id: user?.id,
              friend_id: friendProfile.id,
              status: 'pending'
            }
          ]);

        if (insertError) {
          throw new Error('Failed to send friend request');
        }

        // Step 5: Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              recipient_id: friendProfile.id,
              sender_id: user?.id,
              type: 'friend_request',
              content: null
            }
          ]);

        if (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // Don't throw here as the friend request was successful
        }

        toast({
          title: "Success",
          description: "Friend request sent successfully!",
        });

        setFriendIdentifier("");
      } catch (error: any) {
        console.error('Error in friend request:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send friend request",
          variant: "destructive",
        });
      }
    }
  });

  return {
    friendIdentifier,
    setFriendIdentifier,
    sendFriendRequest,
  };
}