import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBorderClass } from "@/utils/level-utils";

export default function FriendProfile() {
  const { id } = useParams();

  const { data: profile } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name')
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
        .select('level')
        .eq('user_id', id)
        .single();
      return data;
    },
  });

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex items-center gap-4">
        <div className={`rounded-full overflow-hidden ${getBorderClass(stats?.level)}`}>
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile?.display_name}
              className="w-12 h-12 object-cover"
            />
          )}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-semibold">{profile?.display_name}</h1>
            {profile?.username && (
              <span className="text-sm text-muted-foreground">@{profile.username}</span>
            )}
            {stats?.level && (
              <span className="text-xs font-medium text-muted-foreground">
                Lvl {stats.level}
              </span>
            )}
          </div>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}