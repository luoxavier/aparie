import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function signInWithIdentifier(identifier: string, password: string) {
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
    toast({
      variant: "destructive",
      title: "Error signing in",
      description: error.message,
    });
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