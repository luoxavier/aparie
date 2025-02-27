
import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  points: number;
  avatar_url: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  playlist_name?: string;
}

export default function Leaderboard() {
  const { creatorId, playlistName } = useParams<{ creatorId: string; playlistName: string }>();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      if (!creatorId || !playlistName) {
        setError("Missing creatorId or playlistName");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch leaderboard data
        const { data: leaderboardResults, error: leaderboardError } = await supabase
          .from('playlist_leaderboards')
          .select(`
            user_id,
            points,
            profiles!playlist_leaderboards_user_id_fkey (
              display_name,
              username,
              avatar_url
            )
          `)
          .eq('creator_id', creatorId)
          .eq('playlist_name', playlistName)
          .order('points', { ascending: false });

        if (leaderboardError) {
          throw leaderboardError;
        }

        // Fetch flashcards for this playlist
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('creator_id', creatorId)
          .eq('playlist_name', playlistName);

        if (flashcardsError) {
          throw flashcardsError;
        }

        if (leaderboardResults) {
          const formattedData: LeaderboardEntry[] = leaderboardResults.map(item => ({
            user_id: item.user_id,
            display_name: item.profiles.display_name || 'Unknown',
            username: item.profiles.username || 'unknown',
            points: item.points || 0,
            avatar_url: item.profiles.avatar_url
          }));
          setLeaderboardData(formattedData);
        }

        if (flashcardsData) {
          setFlashcards(flashcardsData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [creatorId, playlistName]);

  const handleStudyClick = () => {
    // Get the creator's display name from the first flashcard
    const creatorName = flashcards.length > 0 ? 
      flashcards[0].creator_id === creatorId ? 'You' : 'Unknown Creator' : 
      'Unknown Creator';
      
    // Navigate to the study page with state
    navigate("/study", { 
      state: { 
        flashcards,
        folderName: playlistName,
        creatorName
      } 
    });
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        {isLoading ? (
          <div className="text-center">Loading leaderboard...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error}</div>
        ) : (
          <>
            {leaderboardData.length === 0 ? (
              <div className="text-center">
                <p>No scores available for this playlist</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first!</p>
              </div>
            ) : (
              <ScrollArea className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Rank
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaderboardData.map((entry, index) => (
                      <tr key={entry.user_id}>
                        <td className="p-4 align-middle font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              {entry.avatar_url ? (
                                <AvatarImage src={entry.avatar_url} alt={entry.display_name} />
                              ) : (
                                <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-semibold">{entry.display_name}</p>
                              <p className="text-sm text-muted-foreground">@{entry.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right align-middle font-medium">
                          {entry.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
            <Button 
              variant="outline"
              onClick={handleStudyClick}
              disabled={flashcards.length === 0}
            >
              Study
            </Button>
            <ReturnHomeButton />
          </>
        )}
      </div>
    </PageContainer>
  );
}
