import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Profile } from "@/types/database";

interface FriendCardProps {
  friend: Profile;
}

export function FriendCard({ friend }: FriendCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Add console logs to help debug
  console.log("Friend data:", friend);
  console.log("Dialog state:", isDialogOpen);

  // Ensure friend data is valid before rendering
  if (!friend || !friend.id) {
    console.error("Invalid friend data:", friend);
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
          <Avatar>
            <AvatarImage src={friend.avatar_url || ""} />
            <AvatarFallback>
              {(friend.display_name || friend.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{friend.display_name || friend.username}</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Flashcards for {friend.display_name || friend.username}</DialogTitle>
          <DialogDescription>
            Create and share flashcards with your friend
          </DialogDescription>
        </DialogHeader>
        <CreateMultipleCards 
          preselectedFriend={friend} 
          onComplete={() => setIsDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}