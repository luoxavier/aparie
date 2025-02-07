
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkExistingUsername = async (username: string) => {
  const { data: existingUser, error: queryError } = await supabase
    .from('profiles')
    .select()
    .eq('username', username)
    .maybeSingle();

  if (queryError) {
    toast({
      variant: "destructive",
      title: "Error checking username",
      description: queryError.message,
    });
    throw queryError;
  }

  if (existingUser) {
    toast({
      variant: "destructive",
      title: "Username already taken",
      description: "Try another one!",
    });
    throw new Error("Username taken");
  }
};

export const handleSignUpError = (error: any) => {
  let errorMessage = error.message;
  if (error.message.includes('email_provider_disabled')) {
    errorMessage = 'Email signup is currently disabled. Please contact the administrator.';
  }
  
  toast({
    variant: "destructive",
    title: "Error signing up",
    description: errorMessage,
  });
  throw error;
};
