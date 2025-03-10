
import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlashcardFolder } from "@/components/profile/FlashcardFolder";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Star, Calendar, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

interface UserStats {
  perfect_playlists: number;
  total_playlists_created: number;
  current_streak: number;
  highest_study_minutes: number;
  best_leaderboard_rank: number;
  most_competitive_rank: number;
  most_competitive_total_players: number;
}

export default function FriendProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [friend, setFriend] = useState(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchFriend = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching friend:", error);
        toast.error("Failed to load friend's profile.");
        return;
      }

      setFriend(data);
    };

    const fetchStats = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('user_streaks')
        .select(`
          perfect_playlists,
          total_playlists_created,
          current_streak,
          highest_study_minutes,
          best_leaderboard_rank,
          most_competitive_rank,
          most_competitive_total_players
        `)
        .eq('user_id', id)
        .single();

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      // Ensure all values are numbers, defaulting to 0 if null
      const processedStats: UserStats = {
        perfect_playlists: data?.perfect_playlists ?? 0,
        total_playlists_created: data?.total_playlists_created ?? 0,
        current_streak: data?.current_streak ?? 0,
        highest_study_minutes: data?.highest_study_minutes ?? 0,
        best_leaderboard_rank: data?.best_leaderboard_rank ?? 0,
        most_competitive_rank: data?.most_competitive_rank ?? 0,
        most_competitive_total_players: data?.most_competitive_total_players ?? 0
      };

      setStats(processedStats);
    };

    fetchFriend();
    fetchStats();
  }, [id]);

  const { data: flashcards = [], isLoading, error } = useQuery({
    queryKey: ['friendFlashcards', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          creator_id,
          recipient_id,
          playlist_name,
          front,
          back,
          is_public,
          recipient_can_modify,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('creator_id', id)
        .eq('is_public', true);

      if (error) throw error;

      const groupedFlashcards = data.reduce((acc: any, card) => {
        const key = `${card.creator_id}-${card.playlist_name}`;
        if (!acc[key]) {
          acc[key] = {
            creatorId: card.creator_id,
            playlistName: card.playlist_name,
            creator: card.creator,
            flashcards: []
          };
        }
        acc[key].flashcards.push(card);
        return acc;
      }, {});

      return Object.values(groupedFlashcards);
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: 3,
  });

  const handleRemoveFriend = async () => {
    if (!id || !user) return;

    const { error } = await supabase
      .from('friend_connections')
      .delete()
      .or(`user_id.eq.${user.id},friend_id.eq.${id}`)
      .or(`user_id.eq.${id},friend_id.eq.${user.id}`);

    if (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend.");
      return;
    }

    toast.success("Friend removed successfully!");
    navigate('/friends');
  };

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode) => (
    <div className="flex flex-col items-center justify-center p-4 rounded-md border shadow-sm bg-card">
      <div className="mb-2 text-muted-foreground">{icon}</div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm text-muted-foreground text-center">{title}</span>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          {friend ? (
            <>
              <Avatar>
                <AvatarImage src={friend.avatar_url} alt={friend.username} />
                <AvatarFallback>{friend.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{friend.display_name}</h1>
                <p className="text-muted-foreground">@{friend.username}</p>
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </>
          )}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRemoveFriend}>
                  Remove Friend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats ? (
            <>
              {renderStatCard(
                "Perfect Playlists",
                stats.perfect_playlists || 0,
                <Star className="h-6 w-6" />
              )}
              {renderStatCard(
                "Login Streak",
                `${stats.current_streak || 0} days`,
                <Calendar className="h-6 w-6" />
              )}
              {renderStatCard(
                "Scholar",
                `${stats.highest_study_minutes || 0} mins`,
                <BookOpen className="h-6 w-6" />
              )}
            </>
          ) : (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Public Flashcard Playlists</h2>
          {isLoading ? (
            <div className="animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading flashcards. Please try again later.
            </div>
          ) : flashcards.length === 0 ? (
            <div className="text-center text-muted-foreground">
              This user has no public flashcard playlists.
            </div>
          ) : (
            <ScrollArea>
              <div className="space-y-4">
                {flashcards.map((playlist: any) => (
                  <FlashcardFolder
                    key={`${playlist.creatorId}-${playlist.playlistName}`}
                    title={playlist.playlistName}
                    subtitle={`Created by ${playlist.creator.display_name}`}
                    flashcards={playlist.flashcards}
                    showCreator={false}
                    creatorId={playlist.creatorId}
                    playlistName={playlist.playlistName}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <ReturnHomeButton />
      </div>
    </PageContainer>
  );
}
