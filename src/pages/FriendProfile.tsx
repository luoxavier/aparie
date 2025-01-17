import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

export default function FriendProfile() {
  const { user } = useAuth();
  const { userId } = useParams();

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: mutualFriends } = useQuery({
    queryKey: ['mutual-friends', userId],
    queryFn: async () => {
      const { data: userFriends, error: userFriendsError } = await supabase
        .from('friend_connections')
        .select('friend_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      if (userFriendsError) throw userFriendsError;

      const friendIds = userFriends.map(friend => friend.friend_id);
      return friendIds;
    }
  });

  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{profile?.display_name}</span>
              <span className="text-sm text-muted-foreground">(@{profile?.username})</span>
            </div>
          </div>
        </div>

        {/* Mutual Friends */}
        <div>
          <h2 className="text-xl font-semibold">Mutual Friends</h2>
          <ul>
            {mutualFriends?.map(friendId => (
              <li key={friendId} className="text-sm text-muted-foreground">
                {friendId}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
