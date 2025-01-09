import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CreateCard } from "@/components/CreateCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function FriendsList() {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; display_name: string; username: string | null } | null>(null);

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const { data: connections, error } = await supabase
        .from('friend_connections')
        .select(`
          friend_id,
          user_id,
          profiles!friend_connections_friend_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          ),
          profiles!friend_connections_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;

      return connections.map(connection => {
        // If the current user is the friend_id, we want to show the user_id's profile
        // If the current user is the user_id, we want to show the friend_id's profile
        const isFriend = connection.friend_id === user?.id;
        const friendProfile = isFriend 
          ? connection.profiles!friend_connections_user_id_fkey 
          : connection.profiles!friend_connections_friend_id_fkey;

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
        <Card key={friend.id}>
          <CardContent className="p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedFriend(friend)}
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <div className="flex items-center space-x-4">
                    {friend.avatar_url && (
                      <img
                        src={friend.avatar_url}
                        alt={friend.display_name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">
                        {friend.display_name}
                        {friend.username && (
                          <span className="text-sm text-muted-foreground ml-1">
                            @{friend.username}
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Create Flashcard for {friend.display_name}
                    {friend.username && ` (@${friend.username})`}
                  </DialogTitle>
                </DialogHeader>
                <CreateCard />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}