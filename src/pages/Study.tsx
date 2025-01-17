import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

export default function Study() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Study</h1>
      <ReturnHomeButton />
    </div>
  );
}