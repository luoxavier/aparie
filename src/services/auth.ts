
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function signInWithIdentifier(identifier: string, password: string) {
  try {
    console.log('signInWithIdentifier called with identifier:', identifier);
    
    // Simplify the process - try direct login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier, // Try using the identifier directly as email
      password,
    });
    
    // If direct login failed but it's not due to "Invalid login credentials",
    // it could be some other error, so throw it
    if (error && !error.message?.includes("Invalid login credentials")) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    // If we got data back, login succeeded
    if (data?.user) {
      console.log('Sign in successful with direct email');
      return data;
    }
    
    // If we get here, direct login failed due to invalid credentials,
    // which could mean identifier is a username instead of email
    console.log('Direct email login failed, trying to get email from username');
    
    // Try to get email using rpc function
    try {
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email_from_identifier', { identifier });

      if (emailError) {
        console.error('Error getting email:', emailError);
        throw new Error("Invalid credentials");
      }

      if (!emailData) {
        console.error('No email found for identifier:', identifier);
        throw new Error("User not found");
      }

      // Try login with retrieved email
      const { data: secondAttemptData, error: secondAttemptError } = await supabase.auth.signInWithPassword({
        email: emailData,
        password,
      });

      if (secondAttemptError) {
        console.error('Second sign in attempt error:', secondAttemptError);
        throw secondAttemptError;
      }

      console.log('Sign in successful with username lookup');
      return secondAttemptData;
    } catch (lookupError) {
      console.error('Error in email lookup process:', lookupError);
      throw new Error("Invalid credentials");
    }
  } catch (error: any) {
    console.error('Error in signInWithIdentifier:', error);
    
    // Handle specific error cases
    if (error.message?.includes("Invalid login credentials")) {
      toast({
        variant: "destructive",
        title: "Invalid credentials",
        description: "Please check your email/username and password",
      });
    } else if (error.message?.includes("Email not confirmed")) {
      toast({
        variant: "destructive",
        title: "Email not verified",
        description: "Please verify your email before signing in",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Authentication failed",
      });
    }
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during signout:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was an issue signing out",
      });
      throw error;
    }

    console.log('Signout successful');
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    });
  } catch (error) {
    console.error('Error signing out:', error);
    // Even if there's an error, try to clear the local session
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error('Error clearing local session:', e);
    }
    throw error;
  }
}
