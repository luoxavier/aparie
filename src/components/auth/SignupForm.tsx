import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";
import { checkExistingUsername } from "@/utils/auth-utils";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First check if username is taken
      await checkExistingUsername(username);
      // Then attempt signup
      await signUp(email, password, username, username);
      navigate("/profile");
    } catch (error) {
      const authError = error as AuthError;
      if (authError.status === 422) {
        const errorBody = JSON.parse((authError as any).body);
        if (errorBody.code === "user_already_exists") {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "This email is already registered. Please try logging in instead.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error signing up",
            description: errorBody.message || "An unexpected error occurred",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: authError.message || "An unexpected error occurred",
        });
      }
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}