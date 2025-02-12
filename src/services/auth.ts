
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function signInWithIdentifier(identifier: string, password: string) {
  try {
    // If identifier contains @, treat it as an email
    const email = identifier.includes('@') ? identifier : null;
    
    if (!email) {
      // Get the email using our database function
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email_from_identifier', { identifier });

      if (emailError) {
        console.error('Error getting email:', emailError);
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: "Invalid credentials",
        });
        throw emailError;
      }

      if (!emailData) {
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: "User not found",
        });
        throw new Error("User not found");
      }

      identifier = emailData; // Use the email we found
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email/username and password",
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please verify your email before signing in",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: error.message,
        });
      }
      throw error;
    }

    // Success! The AuthProvider will handle the session update
  } catch (error) {
    console.error('Error in signInWithIdentifier:', error);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string, 
  password: string, 
  username: string, 
  displayName: string
) {
  try {
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
      if (error.message.includes('User already registered')) {
        toast({
          variant: "destructive",
          title: "Account already exists",
          description: "This email is already registered. Please try logging in instead.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: error.message,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // If there's no session, just clear the local state
      await supabase.auth.setSession(null);
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      return;
    }

    // If we have a session, try to sign out properly
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // If it's a session_not_found error, we can ignore it and just clear the local state
      if (error.message.includes('session_not_found')) {
        await supabase.auth.setSession(null);
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account",
        });
        return;
      }
      
      // For other errors, show a toast but still try to clear the local session
      console.error('Error during signout:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was an issue signing out, but your local session has been cleared",
      });
      await supabase.auth.setSession(null);
      return;
    }

    // If everything went well, show success message
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    });
  } catch (error) {
    console.error('Error signing out:', error);
    // Even if there's an error, make sure to clear the local session
    await supabase.auth.setSession(null);
    toast({
      variant: "destructive",
      title: "Error signing out",
      description: "There was an issue signing out, but your local session has been cleared",
    });
  }
}
