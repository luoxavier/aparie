
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just clear the local state
        await supabase.auth.setSession(null);
        queryClient.clear();
        navigate('/login');
        
        toast({
          title: "Signed out successfully",
          description: "Come back tomorrow to keep your streak!",
        });
        return;
      }

      // If we have a session, try to sign out properly
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        // Clear local state even if there's an error
        await supabase.auth.setSession(null);
        queryClient.clear();
        navigate('/login');
        
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: "Your session has been cleared locally",
        });
        return;
      }

      navigate('/login');
      queryClient.clear();
      
      toast({
        title: "Signed out successfully",
        description: "Come back tomorrow to keep your streak!",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local state even if there's an error
      await supabase.auth.setSession(null);
      queryClient.clear();
      navigate('/login');
      
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Your session has been cleared locally",
      });
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
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
