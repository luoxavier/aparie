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
    setLoading(true);

    try {
      await signIn(identifier, password);
      navigate("/");
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      const isInvalidCredentials = 
        error.message?.includes("Invalid login credentials") ||
        error.error?.message?.includes("Invalid login credentials");

      if (isInvalidCredentials) {
        toast({
          title: "Incorrect credentials",
          description: "Please check your email/username and password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error signing in",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Email, username, or display name"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          className="w-full"
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
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}