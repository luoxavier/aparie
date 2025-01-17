import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "./FriendCard";
import { FriendSearchInput } from "./FriendSearchInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Profile } from "@/types/database";

type FriendConnection = {
  friend_id: string;
  user_id: string;
  friend: Profile;
  user: Profile;
};

export function FriendsList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      return profile;
    },
    enabled: !!user?.id,
  });

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
            status,
            created_at,
            updated_at
          ),
          user:profiles!friend_connections_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            status,
            created_at,
            updated_at
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;

      // Create a Map to store unique friends
      const uniqueFriendsMap = new Map<string, Profile>();

      (connections as FriendConnection[]).forEach(connection => {
        const isFriend = connection.friend_id === user?.id;
        const friendProfile = isFriend ? connection.user : connection.friend;
        
        if (!uniqueFriendsMap.has(friendProfile.id)) {
          uniqueFriendsMap.set(friendProfile.id, friendProfile);
        }
      });

      return Array.from(uniqueFriendsMap.values());
    },
    enabled: !!user?.id,
  });

  const filteredFriends = friends?.filter(friend => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      friend.display_name?.toLowerCase().includes(searchTerm) ||
      friend.username?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      {currentUser && (
        <div className="flex items-center space-x-4 p-4 bg-background border rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage src={currentUser.avatar_url || ""} />
            <AvatarFallback>
              {(currentUser.display_name || currentUser.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{currentUser.display_name || currentUser.username}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.status || "Online"}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <FriendSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search friends..."
      />

      {/* Friends List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFriends?.map((friend) => (
          <FriendCard 
            key={friend.id} 
            friend={friend}
          />
        ))}
      </div>
    </div>
  );
}