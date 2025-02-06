
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-[350px] mx-auto space-y-6 my-4">
        <div className="flex flex-col items-center space-y-3 text-center px-2">
          <img 
            src="/lovable-uploads/e352f81d-e5ce-4d6c-a7ce-bc7e005d7898.png"
            alt="Lovable Logo"
            className="w-24 h-24 mb-2 mix-blend-multiply"
          />
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
