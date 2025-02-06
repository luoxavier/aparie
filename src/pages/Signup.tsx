
import { Link } from "react-router-dom";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <img 
            src="/lovable-uploads/e352f81d-e5ce-4d6c-a7ce-bc7e005d7898.png"
            alt="Lovable Logo"
            className="w-24 h-24 mb-2 mix-blend-multiply"
          />
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <SignupForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
