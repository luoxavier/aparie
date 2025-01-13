import { toast } from "@/hooks/use-toast";

interface ErrorBody {
  code?: string;
  message?: string;
}

export const handleSignupError = (error: any) => {
  console.error('Signup error:', error);
  
  let errorBody: ErrorBody | null = null;
  
  try {
    if (typeof error.body === 'string') {
      errorBody = JSON.parse(error.body);
    } else if (typeof error.body === 'object') {
      errorBody = error.body;
    }
  } catch {
    errorBody = null;
  }

  // Handle specific error cases
  if (errorBody?.code === "user_already_exists" || error.message?.includes('User already registered')) {
    toast({
      variant: "destructive",
      title: "Account already exists",
      description: "This email is already registered. Please try logging in instead.",
    });
    return;
  }

  // Default error message
  toast({
    variant: "destructive",
    title: "Error signing up",
    description: errorBody?.message || error.message || "An unexpected error occurred",
  });
};