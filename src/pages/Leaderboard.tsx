import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Leaderboard() {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select(`
          *,
          profile:user_id(username, display_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="space-y-4">
        {leaderboard?.map((entry, index) => (
          <div 
            key={entry.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">{index + 1}</span>
              <div className="flex flex-col">
                <span className="font-medium">
                  {entry.profile?.display_name || entry.profile?.username}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.total_points} points
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}