
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute = ({ children, adminOnly = false }: PrivateRouteProps) => {
  const { user } = useAuth();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If adminOnly is true, check if user has admin role
  if (adminOnly && user.user_metadata?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
