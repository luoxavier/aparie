import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "./FriendCard";
import { Profile, FriendConnection } from "@/types/database";

export function FriendsList() {
  const { user } = useAuth();

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const { data: connections, error } = await supabase
        .from('friend_connections')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at,
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
        .eq('status', 'accepted')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);
      
      if (error) throw error;

      return connections as FriendConnection[];
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends?.map((connection) => {
        const friendProfile = connection.user_id === user?.id ? connection.friend : connection.user;
        return <FriendCard key={connection.id} friend={friendProfile} />;
      })}
    </div>
  );
}