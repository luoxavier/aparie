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
import { useState } from "react";

export function AddFriendDialog() {
  const { friendIdentifier, setFriendIdentifier, sendFriendRequest } = useFriendRequest();
  const [isOpen, setIsOpen] = useState(false);

  const handleSendRequest = async () => {
    if (friendIdentifier) {
      await sendFriendRequest.mutateAsync(friendIdentifier);
      setIsOpen(false);
      setFriendIdentifier("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            onClick={handleSendRequest}
            disabled={sendFriendRequest.isPending || !friendIdentifier}
          >
            {sendFriendRequest.isPending ? "Sending..." : "Send Friend Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}