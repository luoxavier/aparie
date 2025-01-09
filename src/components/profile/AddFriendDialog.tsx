import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

export function AddFriendDialog() {
  const [searchDisplayName, setSearchDisplayName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const searchUsers = async (displayName: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${displayName}%`)
        .neq('id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      return profile;
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      try {
        const { data: existingRequest, error: checkError } = await supabase
          .from('friend_connections')
          .select('*')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingRequest) {
          toast({
            title: "Friend request already exists",
            description: "You already have a pending or accepted friend request with this user.",
            variant: "destructive",
          });
          return;
        }

        const { data: userProfile, error: userProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (userProfileError) {
          throw new Error("Your profile is not set up properly. Please try logging out and back in.");
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

        if (insertError) throw insertError;
      } catch (error: any) {
        console.error('Error in friend request process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent",
        description: "They will be notified of your request.",
      });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending friend request",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Friend</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search display name..."
            value={searchDisplayName}
            onChange={(e) => setSearchDisplayName(e.target.value)}
          />
          <div className="space-y-2">
            {searchDisplayName && (
              <Button
                onClick={async () => {
                  try {
                    const user = await searchUsers(searchDisplayName);
                    if (user) {
                      await sendFriendRequest.mutateAsync(user.id);
                    } else {
                      toast({
                        title: "User not found",
                        description: "No user found with that display name.",
                        variant: "destructive",
                      });
                    }
                  } catch (error: any) {
                    toast({
                      title: "Error searching for user",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Send Friend Request
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}