
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

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with title and button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Friends</h1>
          <AddFriendButton />
        </div>

        {/* Search bar */}
        <FriendSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search friends..."
        />
        
        {/* Add Friend Section - New prominent section below search */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Add New Friends</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Find and connect with other users
              </p>
            </div>
            <Button 
              onClick={() => document.querySelector<HTMLButtonElement>('[data-add-friend-button="true"]')?.click()}
              variant="default"
              size="lg"
              className="w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Find Users to Add
            </Button>
          </div>
        </div>

        {/* Friends List */}
        <div>
          <h2 className="text-lg font-medium mb-3">Your Friends</h2>
          
          {isLoading ? (
            <div className="animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>
        
        <ReturnHomeButton />
      </div>
    </PageContainer>
  );
}
