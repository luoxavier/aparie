import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { findUserByIdentifier, validateFriendRequest, createFriendRequest } from "@/utils/friend-request-utils";

export function useFriendRequest() {
  const [friendIdentifier, setFriendIdentifier] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendFriendRequest = useMutation({
    mutationFn: async (identifier: string) => {
      if (!user) throw new Error("You must be logged in to send friend requests");

      try {
        const friendProfile = await findUserByIdentifier(identifier);
        if (!friendProfile) {
          throw new Error("No user found with that username or display name");
        }

        const validationError = await validateFriendRequest(user.id, friendProfile.id);
        if (validationError) {
          throw new Error(validationError.message);
        }

        await createFriendRequest(user.id, friendProfile.id);
      } catch (error: any) {
        // Check for duplicate connection error
        if (error.message?.includes("duplicate key value")) {
          throw new Error("A friend request already exists between you and this user");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Friend request sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    friendIdentifier,
    setFriendIdentifier,
    sendFriendRequest,
  };
}