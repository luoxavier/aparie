import { FriendRequestItem } from "./FriendRequestItem";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FriendRequest {
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

interface FriendRequestsListProps {
  requests: FriendRequest[];
}

export function FriendRequestsList({ requests }: FriendRequestsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRemoveAll = async () => {
    try {
      const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Success",
        description: "All pending friend requests have been removed.",
      });

      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {requests?.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveAll}
          >
            Remove All Requests
          </Button>
        </div>
      )}
      {requests?.map((request) => (
        <FriendRequestItem
          key={request.user_id}
          requesterId={request.user_id}
          requesterDisplayName={request.profiles.display_name}
          requesterAvatar={request.profiles.avatar_url}
        />
      ))}
    </div>
  );
}