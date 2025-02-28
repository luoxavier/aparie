
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute = ({ children, adminOnly = false }: PrivateRouteProps) => {
  const { user, authError } = useAuth();
  const { toast } = useToast();

  console.log('PrivateRoute rendering with:', { hasUser: !!user, hasError: !!authError });

  // Show toast if there's an auth error
  useEffect(() => {
    if (authError) {
      console.log('PrivateRoute detected auth error:', authError.message);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "There was a problem with authentication. Please try logging in again.",
      });
    }
  }, [authError, toast]);

  // If there's an auth error or no user, redirect to login
  if (authError || !user) {
    // Add a query parameter to the URL to indicate an error
    const errorParam = authError 
      ? `?error=${encodeURIComponent("Authentication failed. Please log in again.")}` 
      : "";
    console.log('PrivateRoute redirecting to login with error param:', errorParam);
    return <Navigate to={`/login${errorParam}`} />;
  }

  // If adminOnly is true, check if user has admin role
  if (adminOnly && user.user_metadata?.role !== 'admin') {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('PrivateRoute allowing access');
  return <>{children}</>;
};

export default PrivateRoute;
