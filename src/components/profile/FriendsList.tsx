import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "./FriendCard";
import { Profile } from "@/types/database";

type FriendConnection = {
  friend_id: string;
  user_id: string;
  friend: Profile;
  user: Profile;
};

export function FriendsList() {
  const { user } = useAuth();

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const { data: connections, error } = await supabase
        .from('friend_connections')
        .select(`
          friend_id,
          user_id,
          friend:profiles!friend_connections_friend_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            created_at,
            updated_at
          ),
          user:profiles!friend_connections_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;

      // Create a Map to store unique friends by their ID
      const uniqueFriendsMap = new Map<string, Profile>();

      (connections as FriendConnection[]).forEach(connection => {
        const isFriend = connection.friend_id === user?.id;
        const friendProfile = isFriend ? connection.user : connection.friend;
        
        // Only add if not already in the map
        if (!uniqueFriendsMap.has(friendProfile.id)) {
          uniqueFriendsMap.set(friendProfile.id, friendProfile);
        }
      });

      // Convert Map values back to array
      return Array.from(uniqueFriendsMap.values());
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends?.map((friend) => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
    </div>
  );
}