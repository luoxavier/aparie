
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { findUserByIdentifier, createFriendRequest } from "@/utils/friend-request-utils";
import type { FriendProfile } from "@/types/friend-request";

export function useFriendRequest() {
  const [friendIdentifier, setFriendIdentifier] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendFriendRequest = useMutation({
    mutationFn: async (identifier: string) => {
      if (!user) throw new Error("You must be logged in to send friend requests");

      try {
        const profiles = await findUserByIdentifier(identifier);
        if (!profiles.length) {
          throw new Error("No user found with that username or display name");
        }
        setSearchResults(profiles);
        
        // If there's only one result, send the request immediately
        if (profiles.length === 1) {
          await createFriendRequest(user.id, profiles[0].id);
          setSearchResults([]);
        }
      } catch (error: any) {
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
    searchResults,
    setSearchResults,
  };
}
