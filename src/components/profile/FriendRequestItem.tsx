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
        // Update the original friend connection status
        const { error: connectionError } = await supabase
          .from('friend_connections')
          .update({ status: 'accepted' })
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (connectionError) throw connectionError;

        // Check if reverse connection exists
        const { data: reverseConnection, error: checkError } = await supabase
          .from('friend_connections')
          .select('id')
          .eq('user_id', user?.id)
          .eq('friend_id', requesterId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (reverseConnection) {
          // Update existing reverse connection
          const { error: reverseUpdateError } = await supabase
            .from('friend_connections')
            .update({ status: 'accepted' })
            .eq('id', reverseConnection.id);

          if (reverseUpdateError) throw reverseUpdateError;
        } else {
          // Create new reverse connection
          const { error: reverseInsertError } = await supabase
            .from('friend_connections')
            .insert([{
              user_id: user?.id,
              friend_id: requesterId,
              status: 'accepted'
            }]);

          if (reverseInsertError) throw reverseInsertError;
        }

        // Create a notification for the requester
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            recipient_id: requesterId,
            sender_id: user?.id,
            type: 'friend_request_accepted',
            content: { message: 'accepted your friend request' }
          }]);

        if (notificationError) throw notificationError;
      } else {
        // Delete the friend connection for deny action
        const { error: deleteError } = await supabase
          .from('friend_connections')
          .delete()
          .eq('user_id', requesterId)
          .eq('friend_id', user?.id);

        if (deleteError) throw deleteError;

        // Create a notification for the requester
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            recipient_id: requesterId,
            sender_id: user?.id,
            type: 'friend_request_denied',
            content: { message: 'denied your friend request' }
          }]);

        if (notificationError) throw notificationError;
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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