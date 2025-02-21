
import { useState, useCallback, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FriendCardProps {
  friend: Profile;
}

export function FriendCard({ friend }: FriendCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState<{ level: number; current_streak: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('level, current_streak')
          .eq('user_id', friend.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user stats:', error);
          return;
        }

        if (data) {
          setUserStats(data);
        }
      } catch (err) {
        console.error('Error in fetchUserStats:', err);
      }
    };

    if (friend?.id) {
      fetchUserStats();
    }
  }, [friend?.id]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  const handleComplete = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleProfileClick = useCallback(() => {
    setIsMenuOpen(false);
    navigate(`/profile/${friend.id}`);
  }, [navigate, friend.id]);

  const handleSendPlaylist = useCallback(() => {
    setIsMenuOpen(false);
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
          <p className="text-sm text-muted-foreground">
            {friend.bio ? 
              friend.bio : 
              userStats ? 
                `Level ${userStats.level} • ${userStats.current_streak} day streak` : 
                'Loading stats...'
            }
          </p>
        </div>
        <DropdownMenu 
          open={isMenuOpen} 
          onOpenChange={setIsMenuOpen}
        >
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <div className="p-2 hover:bg-accent rounded-full">
                <User className="h-5 w-5" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSendPlaylist}>
              <Send className="mr-2 h-4 w-4" />
              Send Playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
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
    </>
  );
}
