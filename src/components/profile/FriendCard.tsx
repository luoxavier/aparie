import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Profile } from "@/types/database";
import { useNavigate } from "react-router-dom";
import { User, Send } from "lucide-react";

interface FriendCardProps {
  friend: Profile;
}

export function FriendCard({ friend }: FriendCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  const handleComplete = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${friend.id}`);
  }, [navigate, friend.id]);

  const handleSendPlaylist = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  // Ensure friend data is valid before rendering
  if (!friend?.id) {
    console.error("Invalid friend data:", friend);
    return null;
  }

  return (
    <>
      <div className="flex items-center space-x-4 p-4 rounded-lg border">
        <Avatar>
          <AvatarImage src={friend.avatar_url || ""} />
          <AvatarFallback>
            {(friend.display_name || friend.username || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{friend.display_name || friend.username}</p>
          {friend.status && (
            <p className="text-sm text-muted-foreground">
              {friend.status}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="p-2 hover:bg-accent rounded-full">
              <User className="h-5 w-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendPlaylist}>
              <Send className="mr-2 h-4 w-4" />
              Send Playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Flashcards for {friend.display_name || friend.username}</DialogTitle>
              <DialogDescription>
                Create and share flashcards with your friend
              </DialogDescription>
            </DialogHeader>
            <CreateMultipleCards 
              preselectedFriend={friend} 
              onComplete={handleComplete}
              hideRecipientSelect
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}