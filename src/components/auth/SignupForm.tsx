
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

  const checkExistingEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      return data?.users.some(user => user.email === email) || false;
    } catch (error) {
      console.error('Error checking email:', error);
      // Fallback to the sign-in check method if admin API fails
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: "dummy-password-for-check"
      });
      return signInError?.message?.includes('Invalid login credentials');
    }
  };

  const checkExistingUsername = async (username: string) => {
    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking username:', error);
      throw error;
    }
    
    return !!existingUser;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);
    try {
      console.log('Checking email:', email);
      // Check for existing email
      const emailExists = await checkExistingEmail(email);
      console.log('Email exists:', emailExists);
      
      if (emailExists) {
        toast({
          variant: "destructive",
          title: "Email already registered",
          description: "This email is already in use. Please try logging in instead.",
        });
        setLoading(false);
        return;
      }

      console.log('Checking username:', username);
      // Check for existing username
      const usernameExists = await checkExistingUsername(username);
      console.log('Username exists:', usernameExists);
      
      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "Username already taken",
          description: "This username is already taken. Please choose a different one.",
        });
        setLoading(false);
        return;
      }

      console.log('Proceeding with signup');
      // If all checks pass, proceed with signup
      await signUp(email, password, username, username);

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
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message || "An error occurred during signup.",
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
