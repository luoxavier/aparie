import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  findUserByIdentifier, 
  validateFriendRequest, 
  createFriendRequest 
} from "@/utils/friend-request-utils";

export function useFriendRequest() {
  const [friendIdentifier, setFriendIdentifier] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const sendFriendRequest = useMutation({
    mutationFn: async (identifier: string) => {
      try {
        const friendProfile = await findUserByIdentifier(identifier);

        if (!friendProfile) {
          toast({
            title: "User not found",
            description: "No user found with that username, display name, or email.",
            variant: "destructive",
          });
          return;
        }

        const validationError = await validateFriendRequest(user?.id || '', friendProfile.id);
        if (validationError) {
          toast({
            title: "Invalid request",
            description: validationError.message,
            variant: "destructive",
          });
          return;
        }

        await createFriendRequest(user?.id || '', friendProfile.id);

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