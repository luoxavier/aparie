import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

export async function signInWithIdentifier(identifier: string, password: string) {
  try {
    // Get the email using our database function
    const { data: emailData, error: emailError } = await supabase
      .rpc('get_user_email_from_identifier', { identifier });

    if (emailError) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: "Invalid credentials",
      });
      throw emailError;
    }

    const email = emailData as string;
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: "User not found",
      });
      throw new Error("User not found");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = "An error occurred during sign in";
      
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in";
      }

      toast({
        variant: "destructive",
        title: "Error signing in",
        description: errorMessage,
      });
      throw error;
    }
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string, 
  password: string, 
  username: string, 
  displayName: string
) {
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
    toast({
      variant: "destructive",
      title: "Error signing up",
      description: error.message,
    });
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}