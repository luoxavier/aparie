import { FriendsList } from "@/components/profile/FriendsList";
import PrivateRoute from "@/components/PrivateRoute";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";

export default function Friends() {
  return (
    <PrivateRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Friends</h1>
          <AddFriendDialog />
        </div>
        <FriendsList />
        <ReturnHomeButton />
      </div>
    </PrivateRoute>
  );
}