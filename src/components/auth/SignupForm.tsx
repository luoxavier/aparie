
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { checkExistingUsername } from "@/utils/auth-utils";
import { AnimatedFeedbackPointer } from "@/components/feedback/AnimatedFeedbackPointer";
import { supabase } from "@/integrations/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);
    try {
      // First check username
      await checkExistingUsername(username);
      
      // Then attempt signup - if email exists, Supabase will return an error
      await signUp(email, password, username, username);
      
      // Show success message and animated pointer
      toast({
        title: "Account created",
        description: "Welcome to the app! Click anywhere to continue.",
        duration: null, // Keep it visible until clicked
        action: <Button variant="outline" onClick={() => navigate("/login")}>Continue</Button>,
      });

      // Show welcome message
      setTimeout(() => {
        toast({
          title: "Welcome! 👋",
          description: "This app is still a work in progress, please help us by letting us know of any bugs, feedback, suggestions, or simply just want to chat!",
          duration: null, // Keep it visible until clicked
        });
        setShowPointer(true);
      }, 1000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Parse error message if it's a JSON string
      let errorMessage = error.message;
      try {
        if (error.body) {
          const errorBody = JSON.parse(error.body);
          errorMessage = errorBody.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }
      
      // Handle specific error cases
      if (errorMessage.includes('User already registered') || error?.body?.includes('user_already_exists')) {
        toast({
          variant: "destructive",
          title: "Email already in use",
          description: "Try another one!",
        });
        return;
      }
      
      if (error?.message?.includes('Username taken')) {
        // This is handled by checkExistingUsername
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: errorMessage || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      {showPointer && <AnimatedFeedbackPointer />}
    </>
  );
}
