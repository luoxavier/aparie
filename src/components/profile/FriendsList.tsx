import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "./FriendCard";

type Profile = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
};

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
            avatar_url
          ),
          user:profiles!friend_connections_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;

      return (connections as FriendConnection[]).map(connection => {
        const isFriend = connection.friend_id === user?.id;
        const friendProfile = isFriend ? connection.user : connection.friend;

        return {
          id: friendProfile.id,
          display_name: friendProfile.display_name,
          username: friendProfile.username,
          avatar_url: friendProfile.avatar_url
        };
      });
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