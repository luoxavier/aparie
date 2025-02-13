import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      // First clear all local query cache
      queryClient.clear();

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // If there's no session, just clear local state
        console.log('No active session found, clearing local state only');
        await supabase.auth.setSession(null);
        navigate('/login');
        
        toast({
          title: "Signed out successfully",
          description: "Come back tomorrow to keep your streak!",
        });
        return;
      }

      // If we have a valid session, try a graceful sign out
      try {
        await supabase.auth.setSession(null); // First clear the session
        const { error } = await supabase.auth.signOut(); // Then try to sign out
        
        if (error) {
          console.error('Error in signOut:', error);
        }
      } catch (error) {
        console.error('Error during sign out process:', error);
      }

      // Always navigate and show success message, even if there were errors
      navigate('/login');
      
      toast({
        title: "Signed out successfully",
        description: "Come back tomorrow to keep your streak!",
      });
    } catch (error) {
      console.error('Error in signOut flow:', error);
      // Ensure we always clear everything locally
      await supabase.auth.setSession(null);
      queryClient.clear();
      navigate('/login');
      
      toast({
        title: "Signed out",
        description: "Your session has been cleared locally",
      });
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string, isTestAccount: boolean = false) => {
    try {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        toast({
          variant: "destructive",
          title: "Username already taken",
          description: "This username is already taken. Please choose a different one.",
        });
        throw new Error("Username taken");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            is_test_account: isTestAccount,
          },
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        }
        
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: errorMessage,
        });
        throw error;
      }

      toast({
        title: "Account created",
        description: "Welcome to the app! Please check your email to verify your account.",
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  return {
    signOut,
    signUp,
  };
}
