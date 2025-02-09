
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export const useUserStreak = () => {
  const updateUserStreak = async (user: User | null) => {
    if (!user) return;

    try {
      // First try to update the streak
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({ last_activity_date: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) {
        // If update fails, the row might not exist, so try to insert
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert([{ 
            user_id: user.id,
            last_activity_date: new Date().toISOString(),
            current_streak: 1,
            highest_streak: 1
          }]);

        if (insertError) {
          console.error('Error creating streak:', insertError);
          return;
        }
      }

      // Get the current streak data
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('current_streak, highest_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return;
      }

      if (streakData) {
        toast({
          title: `Daily Streak: ${streakData.current_streak} days`,
          description: streakData.current_streak > 1 
            ? "Keep up the great work!" 
            : "Welcome back! Start your streak!",
        });
      }
    } catch (error) {
      console.error('Error in updateUserStreak:', error);
    }
  };

  return { updateUserStreak };
};
