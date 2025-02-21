
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/database";

export function useFriendsList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: connections, error } = await supabase
        .from('friend_connections')
        .select(`
          friend:profiles!friend_connections_friend_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Error fetching friends:', error);
        return [];
      }
      
      return connections?.map(c => c.friend) || [];
    },
    enabled: !!user?.id,
  });
}

interface FriendSelectorProps {
  onSelect: (friend: Profile) => void;
  selectedFriendId?: string;
}

export function FriendSelector({ onSelect, selectedFriendId }: FriendSelectorProps) {
  const { data: friends = [], isLoading } = useFriendsList();

  if (isLoading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className={`p-2 rounded cursor-pointer hover:bg-accent ${
            selectedFriendId === friend.id ? 'bg-accent' : ''
          }`}
          onClick={() => onSelect(friend)}
        >
          {friend.display_name || friend.username}
        </div>
      ))}
    </div>
  );
}
