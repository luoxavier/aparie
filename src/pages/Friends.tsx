import { FriendsList } from "@/components/profile/FriendsList";
import PrivateRoute from "@/components/PrivateRoute";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";

export default function Friends() {
  return (
    <PrivateRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        <FriendsList />
        <ReturnHomeButton />
      </div>
    </PrivateRoute>
  );
}