
import { Link, useSearchParams } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");
  const [showErrorMessage, setShowErrorMessage] = useState(!!errorParam);
  const { authError } = useAuth();
  
  // Show error message from URL param or auth context
  const errorMessage = errorParam || (authError ? authError.message : null);
  
  // Hide error message after 10 seconds
  useEffect(() => {
    if (errorMessage) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => {
        setShowErrorMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-[350px] mx-auto space-y-6 my-4">
        {showErrorMessage && errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center space-y-3 text-center px-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground px-4">
            Enter your credentials to sign in
          </p>
        </div>
        <div className="px-2">
          <LoginForm />
        </div>
        <p className="text-center text-sm text-muted-foreground px-4 pb-4">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="underline underline-offset-4 hover:text-primary inline-block"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
