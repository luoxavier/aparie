
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBorderClass } from "@/utils/level-utils";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function FriendProfile() {
  const { id } = useParams();

  const { data: profile } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name, status')
        .eq('id', id)
        .single();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_streaks')
        .select('level, current_streak, highest_streak')
        .eq('user_id', id)
        .single();
      return data;
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ['user-achievements', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('playlist_leaderboards')
        .select(`
          points,
          playlist_name,
          creator:profiles!playlist_leaderboards_creator_id_fkey (
            display_name
          )
        `)
        .eq('user_id', id)
        .order('points', { ascending: false })
        .limit(5);

      // For each playlist, get its rank
      if (data) {
        const rankedData = await Promise.all(data.map(async (achievement) => {
          const { data: rankData } = await supabase
            .from('playlist_leaderboards')
            .select('user_id')
            .eq('playlist_name', achievement.playlist_name)
            .order('points', { ascending: false });

          const rank = rankData?.findIndex((item) => item.user_id === id) ?? -1;
          return {
            ...achievement,
            rank: rank + 1, // Add 1 since array index starts at 0
          };
        }));

        return rankedData.filter(item => item.rank <= 5);
      }
      return [];
    },
  });

  return (
    <div className="container mx-auto py-4 px-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className={`rounded-full overflow-hidden ${getBorderClass(stats?.level)}`}>
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile?.display_name}
              className="w-16 h-16 object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-semibold">{profile?.display_name}</h1>
            {profile?.username && (
              <span className="text-sm text-muted-foreground">@{profile.username}</span>
            )}
          </div>
          {profile?.status && (
            <p className="text-sm text-muted-foreground mt-1">{profile.status}</p>
          )}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Level</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.level || 1}</p>
        </div>

        <div className="p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.current_streak || 0} days</p>
        </div>

        <div className="p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Highest Streak</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.highest_streak || 0} days</p>
        </div>
      </div>

      {/* Achievements Section */}
      {achievements && achievements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Top Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <Link
                key={`${achievement.playlist_name}-${index}`}
                to={`/leaderboard/${achievement.creator_id}/${achievement.playlist_name}`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{achievement.playlist_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created by {achievement.creator.display_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">
                      Rank #{achievement.rank} • {achievement.points} pts
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Public Playlists Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Public Playlists</h2>
        <PublicPlaylists creatorId={id} />
      </div>
    </div>
  );
}
