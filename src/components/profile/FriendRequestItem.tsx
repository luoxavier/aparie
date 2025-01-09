import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FriendRequestItemProps {
  requesterId: string;
  requesterDisplayName: string;
  requesterAvatar?: string;
}

export function FriendRequestItem({ requesterId, requesterDisplayName, requesterAvatar }: FriendRequestItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleFriendRequest = useMutation({
    mutationFn: async (action: 'accept' | 'deny') => {
      if (action === 'accept') {
        const { error } = await supabase
          .from('friend_connections')
          .update({ status: 'accepted' })
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friend_connections')
          .delete()
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables === 'accept' ? "Friend request accepted" : "Friend request denied",
        description: variables === 'accept' 
          ? "You are now friends!" 
          : "The friend request has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error handling friend request",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        {requesterAvatar && (
          <img
            src={requesterAvatar}
            alt={requesterDisplayName}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <p className="font-medium">{requesterDisplayName}</p>
          <p className="text-sm text-muted-foreground">Sent you a friend request</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => handleFriendRequest.mutate('accept')}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleFriendRequest.mutate('deny')}
        >
          Deny
        </Button>
      </div>
    </div>
  );
}