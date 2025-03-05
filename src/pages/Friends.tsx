
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
import { UserPlus, Users, UserCheck, Search } from "lucide-react";

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
    console.log("Friends component rendered");
  }, [refetch]);

  return (
    <PageContainer>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* PROMINENT HEADER WITH BORDER AND BACKGROUND */}
        <div className="bg-background shadow-sm rounded-lg p-6 border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">Friends</h1>
            </div>
            <AddFriendButton />
          </div>
        </div>

        {/* Search bar with visible label */}
        <div className="bg-background shadow-sm rounded-lg p-6 border">
          <label className="block text-lg font-semibold mb-2">Search Friends</label>
          <FriendSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or username..."
          />
        </div>
        
        {/* ADD FRIEND SECTION - Highly visible with contrasting background */}
        <div className="p-6 bg-primary/10 dark:bg-primary/5 rounded-lg shadow border border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add New Friends
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Find and connect with other users on the platform
              </p>
            </div>
            <Button 
              onClick={() => document.querySelector<HTMLButtonElement>('[data-add-friend-button="true"]')?.click()}
              variant="default"
              size="lg"
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              <Search className="mr-2 h-5 w-5" />
              Find Users to Add
            </Button>
          </div>
        </div>

        {/* FRIENDS LIST - With icon and background */}
        <div className="bg-background shadow-sm rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Your Friends
          </h2>
          
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
        
        <div className="flex justify-center mt-8">
          <ReturnHomeButton />
        </div>
      </div>
    </PageContainer>
  );
}
