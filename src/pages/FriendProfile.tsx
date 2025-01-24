import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Award, Star, List } from "lucide-react";
import { FlashcardFolder } from "@/components/profile/FlashcardFolder";

export default function FriendProfile() {
  const { id } = useParams();

  const { data: friendProfile } = useQuery({
    queryKey: ['friendProfile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name, status')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['friend-stats', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('level, xp, next_level_xp, current_streak, highest_streak')
        .eq('user_id', id)
        .maybeSingle();
      
      if (error) throw error;

      // Return default values if no stats found
      if (!data) {
        return {
          level: 1,
          xp: 0,
          next_level_xp: 100,
          current_streak: 0,
          highest_streak: 0
        };
      }

      return data;
    },
  });

  const { data: publicPlaylists = [] } = useQuery({
    queryKey: ['friend-public-playlists', id],
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

      // Group flashcards by playlist_name
      const groupedPlaylists = data.reduce((acc: any, card) => {
        if (!acc[card.playlist_name]) {
          acc[card.playlist_name] = {
            playlistName: card.playlist_name,
            creator: card.creator,
            flashcards: []
          };
        }
        acc[card.playlist_name].flashcards.push(card);
        return acc;
      }, {});

      return Object.values(groupedPlaylists);
    },
  });

  const xpProgress = userStats ? (userStats.xp / userStats.next_level_xp) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-6 bg-background p-6 rounded-lg border">
          <Avatar className="h-24 w-24">
            <AvatarImage src={friendProfile?.avatar_url || ""} />
            <AvatarFallback>
              {(friendProfile?.display_name || friendProfile?.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{friendProfile?.display_name || friendProfile?.username}</h1>
              {friendProfile?.status && (
                <p className="text-sm text-muted-foreground mt-1">{friendProfile.status}</p>
              )}
            </div>

            {userStats && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">Level {userStats.level}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>XP Progress</span>
                    <span className="text-muted-foreground">{userStats.xp}/{userStats.next_level_xp} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div className="text-sm">
                      <p className="font-medium">{userStats.current_streak} day streak</p>
                      <p className="text-muted-foreground">Best: {userStats.highest_streak}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Public Playlists */}
        {publicPlaylists.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Public Playlists</h2>
            </div>
            
            <div className="space-y-4">
              {publicPlaylists.map((playlist: any) => (
                <FlashcardFolder
                  key={`${id}-${playlist.playlistName}`}
                  title={playlist.playlistName}
                  subtitle={`Created by ${playlist.creator.display_name}`}
                  flashcards={playlist.flashcards}
                  showCreator={false}
                  creatorId={id}
                  playlistName={playlist.playlistName}
                />
              ))}
            </div>
          </div>
        )}

        <ReturnHomeButton />
      </div>
    </div>
  );
}