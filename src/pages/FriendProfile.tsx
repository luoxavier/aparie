import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FriendProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const { data: sharedFriends } = useQuery({
    queryKey: ['shared-friends', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_connections')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;
      return data?.map(connection => connection.friend_id) || [];
    }
  });

  const handleNavigateToProfile = (friendId: string) => {
    navigate(`/profile/${friendId}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Friends</h1>
      <ul>
        {sharedFriends?.map(friendId => (
          <li key={friendId} className="flex items-center justify-between">
            <span>{friendId}</span>
            <Button onClick={() => handleNavigateToProfile(friendId)}>View Profile</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
