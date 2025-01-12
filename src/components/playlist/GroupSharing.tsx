import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendSelector } from "../profile/FriendSelector";

interface GroupSharingProps {
  playlistId: string;
  playlistName: string;
  creatorId: string;
}

export function GroupSharing({ playlistId, playlistName, creatorId }: GroupSharingProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string>();
  const [canModify, setCanModify] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!selectedFriendId) return;

    try {
      const { error } = await supabase
        .from('playlist_permissions')
        .insert({
          playlist_name: playlistName,
          creator_id: creatorId,
          user_id: selectedFriendId,
          can_modify: canModify,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Playlist shared successfully",
      });
    } catch (error) {
      console.error("Error sharing playlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share playlist. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Share with friend</Label>
        <FriendSelector
          selectedFriendId={selectedFriendId}
          onSelect={(friend) => setSelectedFriendId(friend.id)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="can-modify"
          checked={canModify}
          onCheckedChange={setCanModify}
        />
        <Label htmlFor="can-modify">Allow modifications</Label>
      </div>

      <Button onClick={handleShare} className="w-full" disabled={!selectedFriendId}>
        Share Playlist
      </Button>
    </div>
  );
}