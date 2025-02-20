
import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  points: number;
  avatar_url: string | null;
}

export default function Leaderboard() {
  const { creatorId, playlistName } = useParams<{ creatorId: string; playlistName: string }>();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      if (!creatorId || !playlistName) {
        setError("Missing creatorId or playlistName");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
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

        if (error) {
          throw error;
        }

        if (data) {
          const formattedData: LeaderboardEntry[] = data.map(item => ({
            user_id: item.user_id,
            display_name: item.profiles.display_name || 'Unknown',
            username: item.profiles.username || 'unknown',
            points: item.points || 0,
            avatar_url: item.profiles.avatar_url
          }));
          setLeaderboardData(formattedData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [creatorId, playlistName]);

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
              <div className="text-center">No scores available for this playlist.</div>
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
            <Button asChild variant="outline">
              <Link to="/study">Back to Study</Link>
            </Button>
          </>
        )}
      </div>
    </PageContainer>
  );
}
