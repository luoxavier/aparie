import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FriendSearchInput } from "./FriendSearchInput";
import { useFriendRequest } from "@/hooks/useFriendRequest";
import { UserPlus } from "lucide-react";

export function AddFriendDialog() {
  const { friendIdentifier, setFriendIdentifier, sendFriendRequest } = useFriendRequest();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter your friend's username to send them a friend request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FriendSearchInput
            value={friendIdentifier}
            onChange={setFriendIdentifier}
          />
          <Button
            onClick={() => {
              if (friendIdentifier) {
                sendFriendRequest.mutate(friendIdentifier);
              }
            }}
          >
            Send Friend Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}