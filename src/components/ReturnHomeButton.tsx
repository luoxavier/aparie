import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReturnHomeButton() {
  const navigate = useNavigate();

  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4" />
        Return to Home
      </Button>
    </div>
  );
}