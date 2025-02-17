
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReturnHomeButton() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleHomeClick}
      >
        <Home className="h-4 w-4" />
        Return to Home
      </Button>
    </div>
  );
}
