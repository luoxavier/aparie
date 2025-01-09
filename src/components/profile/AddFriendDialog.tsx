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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${username}%`)
      .neq('id', user?.id)
      .limit(5);

    if (error) throw error;
    return data;
  };

  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
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
                  const users = await searchUsers(searchUsername);
                  if (users && users.length > 0) {
                    await sendFriendRequest.mutateAsync(users[0].id);
                  } else {
                    toast({
                      title: "User not found",
                      description: "No user found with that username.",
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