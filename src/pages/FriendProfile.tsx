import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardFolder } from "@/components/profile/FlashcardFolder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Trophy, Flame } from "lucide-react";

export default function FriendProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  // Fetch friend's profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch friend's public playlists
  const { data: publicPlaylists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['public-playlists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          front,
          back,
          playlist_name,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('creator_id', id)
        .eq('is_public', true);

      if (error) throw error;

      // Group by playlist name
      return Object.values(data.reduce((acc: any, card) => {
        const key = card.playlist_name;
        if (!acc[key]) {
          acc[key] = {
            playlistName: card.playlist_name,
            creator: card.creator,
            flashcards: []
          };
        }
        acc[key].flashcards.push(card);
        return acc;
      }, {}));
    },
  });

  // Fetch shared friends
  const { data: sharedFriends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['shared-friends', id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          friend:profiles!friend_connections_friend_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted')
        .in('friend_id', (
          supabase
            .from('friend_connections')
            .select('friend_id')
            .eq('user_id', id)
            .eq('status', 'accepted')
        ));

      if (error) throw error;
      return data.map(d => d.friend);
    },
  });

  // Fetch user streak and points
  const { data: streakData, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['user-streak', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoadingProfile) {
    return <div className="container mx-auto py-8"><Skeleton className="h-48 w-full" /></div>;
  }

  if (!profile) {
    return <div className="container mx-auto py-8">Profile not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback>
              {(profile.display_name || profile.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            {profile.username && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStreak ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                streakData?.current_streak || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStreak ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                streakData?.total_points || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFriends ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                sharedFriends.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="playlists" className="w-full">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="playlists" className="flex-1">Public Playlists</TabsTrigger>
          <TabsTrigger value="friends" className="flex-1">Shared Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-6">
          {isLoadingPlaylists ? (
            <Skeleton className="h-48 w-full" />
          ) : publicPlaylists.length > 0 ? (
            <div className="space-y-4">
              {publicPlaylists.map((playlist: any) => (
                <FlashcardFolder
                  key={playlist.playlistName}
                  title={playlist.playlistName}
                  subtitle={`Created by ${playlist.creator.display_name}`}
                  flashcards={playlist.flashcards}
                  showCreator={true}
                  creatorId={id}
                  playlistName={playlist.playlistName}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No public playlists available</p>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          {isLoadingFriends ? (
            <Skeleton className="h-48 w-full" />
          ) : sharedFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || ""} />
                    <AvatarFallback>
                      {(friend.display_name || friend.username || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.display_name}</p>
                    {friend.username && (
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No shared friends</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}