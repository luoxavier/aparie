
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PlaylistNotificationProps {
  content: {
    playlistName?: string;
    message?: string;
  };
  senderId: string;
  senderName: string;
  onMarkAsRead: (id: string) => void;
  id: string;
  onExit: () => void;
}

export function PlaylistNotification({
  content,
  senderId,
  senderName,
  onMarkAsRead,
  id,
  onExit
}: PlaylistNotificationProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!content?.playlistName) return;

    try {
      const { data: flashcards, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          front,
          back,
          creator_id,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('playlist_name', content.playlistName)
        .eq('creator_id', senderId);

      if (error) throw error;

      onExit();
      setTimeout(() => {
        onMarkAsRead(id);
        navigate('/study', {
          state: {
            flashcards: flashcards.map(card => ({
              id: card.id,
              front: card.front,
              back: card.back,
              creator_id: card.creator_id
            })),
            folderName: content.playlistName,
            creatorName: senderName
          }
        });
      }, 300);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load playlist",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="h-8 w-8"
    >
      <List className="h-4 w-4" />
    </Button>
  );
}
