
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

export const useUserStreak = () => {
  const queryClient = useQueryClient();

  const updateUserStreak = async (user: User | null) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to get the existing streak with a single query
      const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('current_streak, highest_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return;
      }

      if (!existingStreak) {
        // Create new streak record if none exists
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert([{ 
            user_id: user.id,
            last_activity_date: today,
            current_streak: 1,
            highest_streak: 1
          }]);

        if (insertError) {
          console.error('Error creating streak:', insertError);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        queryClient.invalidateQueries({ queryKey: ['streaks', user.id] });

        toast({
          title: "Welcome!",
          description: "Start your learning streak today!",
        });
        return;
      }

      const lastActivity = new Date(existingStreak.last_activity_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isConsecutiveDay = lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
      const isSameDay = lastActivity.toISOString().split('T')[0] === today;

      // Only update if it's not the same day
      if (!isSameDay) {
        const newStreak = isConsecutiveDay ? existingStreak.current_streak + 1 : 1;
        const newHighestStreak = Math.max(newStreak, existingStreak.highest_streak);

        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({ 
            last_activity_date: today,
            current_streak: newStreak,
            highest_streak: newHighestStreak
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating streak:', updateError);
          return;
        }

        // Invalidate queries to update UI
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        queryClient.invalidateQueries({ queryKey: ['streaks', user.id] });

        toast({
          title: `Daily Streak: ${newStreak} days`,
          description: newStreak > 1 
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
