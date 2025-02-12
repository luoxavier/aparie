
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    try {
      await signIn(identifier, password);
      // Success toast and navigation are handled by the AuthProvider
    } catch (error: any) {
      console.error("Error signing in:", error);
      setPassword(""); // Clear password on error for security
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          className="w-full"
          disabled={loading}
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
          disabled={loading}
          autoComplete="current-password"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !identifier || !password}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
