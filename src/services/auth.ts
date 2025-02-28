
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function signInWithIdentifier(identifier: string, password: string) {
  try {
    console.log('signInWithIdentifier called with identifier:', identifier);
    let email = identifier;
    
    // Only lookup email if the identifier is not already an email
    if (!identifier.includes('@')) {
      console.log('Looking up email from identifier');
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
        console.error('No email found for identifier:', identifier);
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: "User not found",
        });
        throw new Error("User not found");
      }

      email = emailData;
      console.log('Email found for identifier');
    }

    console.log('Attempting to sign in with email');
    const { error } = await supabase.auth.signInWithPassword({
      email,
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

    console.log('Sign in successful');
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
  displayName: string,
  isTestAccount: boolean = false
) {
  try {
    console.log('signUpWithEmail called');
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
      console.error('Error signing up:', error);
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
    console.log('Sign up successful');
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    console.log('signOut called');
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found, clearing local state');
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
      console.error('Error during signout:', error);
      // If it's a session_not_found error, we can ignore it and just clear the local state
      if (error.message.includes('session_not_found')) {
        console.log('Session not found error, clearing local state');
        await supabase.auth.setSession(null);
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account",
        });
        return;
      }
      
      // For other errors, show a toast but still try to clear the local session
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was an issue signing out, but your local session has been cleared",
      });
      await supabase.auth.setSession(null);
      return;
    }

    console.log('Signout successful');
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
