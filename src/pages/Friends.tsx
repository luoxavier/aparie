
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { PageContainer } from "@/components/ui/page-container";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "@/components/profile/FriendCard";
import { FriendSearchInput } from "@/components/profile/FriendSearchInput";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { AddFriendButton } from "@/components/profile/AddFriendButton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface Friend {
  id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
  connection_id: string;
  status: string;
}

export default function Friends() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: friends = [], isLoading, refetch } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          id,
          status,
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
        .eq('user_id', user.id);

      if (error) {
        toast.error("Error loading friends");
        throw error;
      }

      return (data || []).map(connection => ({
        connection_id: connection.id,
        status: connection.status,
        ...connection.friend,
      })) as Friend[];
    },
    enabled: !!user,
    staleTime: 1000 * 60,
    retry: 3,
  });

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Friends</h1>
            <Button 
              disabled
              variant="default"
              className="mb-4"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </div>
          <FriendSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search friends..."
          />
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Friends</h1>
          <AddFriendButton />
        </div>

        <FriendSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search friends..."
        />

        {filteredFriends.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchTerm ? "No friends found matching your search" : "No friends yet"}
            <div className="mt-4">
              <Button 
                onClick={() => document.querySelector<HTMLButtonElement>('[data-add-friend-button="true"]')?.click()}
                variant="outline"
                className="mx-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add your first friend
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={{
                  id: friend.id,
                  username: friend.username || "",
                  display_name: friend.display_name,
                  avatar_url: friend.avatar_url,
                  bio: friend.bio,
                  created_at: friend.created_at,
                  updated_at: friend.updated_at,
                  status: friend.status
                }}
              />
            ))}
          </div>
        )}
        <ReturnHomeButton />
      </div>
    </PageContainer>
  );
}
