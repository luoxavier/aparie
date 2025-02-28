
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AnimatedFeedbackPointer } from "@/components/feedback/AnimatedFeedbackPointer";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validateInputs = () => {
    // Email validation
    if (!email) {
      setError("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Username validation
    if (!username) {
      setError("Username is required");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    // Password validation
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      // First check if the username is taken
      const { data: existingUsername, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle();

      if (usernameError) {
        console.error("Error checking username:", usernameError);
        throw new Error("Error validating username");
      }

      if (existingUsername) {
        setError("This username is already taken. Please choose a different one.");
        setLoading(false);
        return;
      }

      // Automatically detect if this is a test account based on username
      const isTestAccount = username.toLowerCase().startsWith('test');

      // If username is available, proceed with signup
      await signUp(email.trim(), password, username.trim(), username.trim(), isTestAccount);

      // Show success message
      toast({
        title: "Account created successfully! 🎉",
        description: "Welcome aboard! Click anywhere to continue.",
      });

      // Show welcome/feedback message with pointer
      setTimeout(() => {
        toast({
          title: "Welcome! 👋",
          description: "This app is still a work in progress. We'd love to hear your feedback and suggestions!",
        });
        setShowPointer(true);
      }, 1000);

      // Navigate to profile page after a short delay
      setTimeout(() => {
        navigate("/profile");
        window.location.reload(); // Refresh the page
      }, 2000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        setError("This email is already in use. Please try logging in instead.");
      } else {
        setError(error.message || "An error occurred during signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            required
            minLength={6}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || !email || !username || !password}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      {showPointer && <AnimatedFeedbackPointer />}
    </>
  );
}
