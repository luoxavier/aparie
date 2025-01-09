import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const { signIn, signUp } = useAuth();

  const checkUsername = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from("login")
        .select("username")
        .eq("username", username)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(false); // Reset error state when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Check if username exists before attempting signup
        const usernameTaken = await checkUsername(username);
        if (usernameTaken) {
          setUsernameError(true);
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive",
          });
          return;
        }

        // For signup, we'll use email as username@domain.com to satisfy Supabase's email requirement
        await signUp(`${username}@flashcards.local`, password, username);
        toast({
          title: "Account created!",
          description: "You can now sign in with your username and password.",
        });
      } else {
        await signIn(`${username}@flashcards.local`, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp
              ? "Sign up to create and share flashcards"
              : "Sign in to continue learning"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                required
                className={`${
                  usernameError ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setUsernameError(false); // Reset error state when switching modes
              }}
              className="text-primary hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};