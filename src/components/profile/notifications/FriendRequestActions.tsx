
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useFriendRequestHandler } from "./useFriendRequestHandler";

interface FriendRequestActionsProps {
  id: string;
  senderId: string;
  senderName: string;
  onMarkAsRead: (id: string) => void;
}

export function FriendRequestActions({
  id,
  senderId,
  senderName,
  onMarkAsRead
}: FriendRequestActionsProps) {
  const friendRequest = useFriendRequestHandler(id, senderId, senderName, onMarkAsRead);

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => friendRequest.mutate('accept')}
        className="h-8 w-8 text-green-500 hover:text-green-600"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => friendRequest.mutate('deny')}
        className="h-8 w-8 text-red-500 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
