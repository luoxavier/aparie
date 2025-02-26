
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PublicPlaylistToggleProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  creatorId?: string;
  playlistName?: string;
  onToggleComplete?: () => void;
}

export function PublicPlaylistToggle({ 
  isPublic, 
  setIsPublic, 
  creatorId,
  playlistName,
  onToggleComplete 
}: PublicPlaylistToggleProps) {
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    if (!creatorId || !playlistName) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .update({ is_public: checked })
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (error) throw error;

      setIsPublic(checked);
      toast({
        title: "Success",
        description: checked ? "Playlist is now public" : "Playlist is now private",
      });

      if (onToggleComplete) {
        onToggleComplete();
      }
    } catch (error) {
      console.error('Error updating playlist privacy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update playlist privacy. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="public-playlist"
        checked={isPublic}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="public-playlist">Make this playlist public</Label>
    </div>
  );
}
