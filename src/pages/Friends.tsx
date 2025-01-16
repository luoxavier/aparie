import { FriendsList } from "@/components/profile/FriendsList";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Friends() {
  const navigate = useNavigate();

  return (
    <PrivateRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        <FriendsList />
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
      </div>
    </PrivateRoute>
  );
}