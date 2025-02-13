
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useFriendRequestHandler(
  id: string,
  senderId: string,
  senderName: string,
  onMarkAsRead: (id: string) => void
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: 'accept' | 'deny') => {
      if (action === 'accept') {
        // First check if there's already a connection
        const { data: existingConnection, error: checkError } = await supabase
          .from('friend_connections')
          .select('id, status')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${senderId}),and(user_id.eq.${senderId},friend_id.eq.${user?.id})`)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingConnection?.status === 'accepted') {
          throw new Error('You are already friends with this user');
        }

        // Create friend connection if none exists
        if (!existingConnection) {
          const { error: connectionError } = await supabase
            .from('friend_connections')
            .insert([{
              user_id: user?.id,
              friend_id: senderId,
              status: 'accepted'
            }]);

          if (connectionError) throw connectionError;
        } else {
          // Update existing connection to accepted
          const { error: updateError } = await supabase
            .from('friend_connections')
            .update({ status: 'accepted' })
            .eq('id', existingConnection.id);

          if (updateError) throw updateError;
        }

        // Mark notification as read only after successful friend request handling
        onMarkAsRead(id);
      } else {
        // For deny action, delete the friend request
        const { error: deleteError } = await supabase
          .from('friend_connections')
          .delete()
          .eq('user_id', senderId)
          .eq('friend_id', user?.id);

        if (deleteError) throw deleteError;

        // Mark notification as read after denying
        onMarkAsRead(id);
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables === 'accept' ? "Friend request accepted" : "Friend request denied",
        description: variables === 'accept' 
          ? `You are now friends with ${senderName}!` 
          : `Friend request from ${senderName} has been denied.`,
      });
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
}
