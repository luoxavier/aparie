import { AuthError } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface ErrorBody {
  code?: string;
  message?: string;
}

export const handleSignupError = (error: unknown) => {
  console.error("Signup error:", error);
  
  if (error instanceof AuthError) {
    // Parse the error body if it exists
    let errorBody: ErrorBody | null = null;
    try {
      errorBody = JSON.parse((error as any).body);
    } catch {
      errorBody = null;
    }

    if (errorBody?.code === "user_already_exists" || error.message.includes('User already registered')) {
      toast({
        variant: "destructive",
        title: "Account already exists",
        description: "This email is already registered. Please try logging in instead.",
      });
    } else if (errorBody?.code === "weak_password") {
      toast({
        variant: "destructive",
        title: "Password too weak",
        description: errorBody.message || "Please choose a stronger password.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: errorBody?.message || error.message || "An unexpected error occurred",
      });
    }
  } else {
    toast({
      variant: "destructive",
      title: "Error signing up",
      description: (error as Error).message || "An unexpected error occurred",
    });
  }
};