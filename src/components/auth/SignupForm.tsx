
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AnimatedFeedbackPointer } from "@/components/feedback/AnimatedFeedbackPointer";
import { supabase } from "@/integrations/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
        duration: null,
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
      // First check if email exists using our database function
      const { data: existingEmail, error: emailCheckError } = await supabase
        .rpc('get_user_email_from_identifier', { identifier: email });

      if (emailCheckError) {
        console.error('Error checking email:', emailCheckError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while checking email availability.",
          duration: null,
        });
        setLoading(false);
        return;
      }

      if (existingEmail) {
        toast({
          variant: "destructive",
          title: "Email already registered",
          description: "This email is already registered. Please try logging in instead.",
          duration: null,
        });
        setLoading(false);
        return;
      }

      // Then check if username exists
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
          duration: null,
        });
        setLoading(false);
        return;
      }

      // Now try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (signUpError) {
        let errorMessage = signUpError.message;
        // Just in case our previous check missed it
        if (signUpError.message.includes('User already registered')) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        }
        
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: errorMessage,
          duration: null,
        });
        setLoading(false);
        return;
      }

      // Show success message
      toast({
        title: "Account created",
        description: "Welcome to the app! Click anywhere to continue.",
        duration: null,
        action: <Button variant="outline" onClick={() => navigate("/login")}>Continue</Button>,
      });

      // Show welcome/feedback message
      setTimeout(() => {
        toast({
          title: "Welcome! 👋",
          description: "This app is still a work in progress, please help us by letting us know of any bugs, feedback, suggestions, or simply just want to chat!",
          duration: null,
        });
        setShowPointer(true);
      }, 1000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message || "An unexpected error occurred",
        duration: null,
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
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      {showPointer && <AnimatedFeedbackPointer />}
    </>
  );
}

