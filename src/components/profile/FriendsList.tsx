import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function FriendsList() {
  const { user } = useAuth();

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          friend_id,
          profiles!friend_connections_friend_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends?.map((friend) => (
        <Card key={friend.friend_id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {friend.profiles.avatar_url && (
                <img
                  src={friend.profiles.avatar_url}
                  alt={friend.profiles.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h3 className="font-medium">{friend.profiles.username}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}