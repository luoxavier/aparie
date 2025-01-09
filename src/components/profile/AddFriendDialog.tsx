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
  const [searchUsername, setSearchUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const searchUsers = async (username: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${username}%`)
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
      // First check if a friend request already exists
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

      const { error } = await supabase
        .from('friend_connections')
        .insert([
          {
            user_id: user?.id,
            friend_id: friendId,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Error sending friend request:', error);
        toast({
          title: "Error sending friend request",
          description: error.message,
          variant: "destructive",
        });
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
            placeholder="Search username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <div className="space-y-2">
            {searchUsername && (
              <Button
                onClick={async () => {
                  try {
                    const user = await searchUsers(searchUsername);
                    if (user) {
                      await sendFriendRequest.mutateAsync(user.id);
                    } else {
                      toast({
                        title: "User not found",
                        description: "No user found with that username.",
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