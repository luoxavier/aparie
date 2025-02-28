
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    // Basic input validation
    if (!identifier.trim()) {
      setError("Email or username is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }
    
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      await signIn(identifier.trim(), password);
      // Success toast and navigation are handled by the AuthProvider
    } catch (error: any) {
      console.error("Error signing in:", error);
      setPassword(""); // Clear password on error for security
      
      // Show error message in the form
      if (error.message?.includes("Invalid login credentials")) {
        setError("Invalid email/username or password");
      } else if (error.message?.includes("User not found")) {
        setError("User not found. Please check your email/username");
      } else if (error.message?.includes("Email not confirmed")) {
        setError("Please verify your email before signing in");
      } else {
        setError("An error occurred while signing in. Please try again.");
      }

      // Also show toast for better visibility
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setError(null); // Clear error when user types
          }}
          required
          className="w-full"
          disabled={loading}
          autoComplete="username"
          aria-invalid={!!error}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null); // Clear error when user types
          }}
          required
          className="w-full"
          disabled={loading}
          autoComplete="current-password"
          aria-invalid={!!error}
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
