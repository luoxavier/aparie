
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface PublicPlaylistToggleProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

export function PublicPlaylistToggle({ isPublic, setIsPublic }: PublicPlaylistToggleProps) {
  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('playlistPublic') === 'true';
    setIsPublic(savedState);
  }, [setIsPublic]);

  // Handle toggle and save state
  const handleToggle = (checked: boolean) => {
    setIsPublic(checked);
    localStorage.setItem('playlistPublic', checked.toString());
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="public-playlist"
        checked={isPublic}
        onCheckedChange={handleToggle}
        aria-label="Toggle playlist visibility"
      />
      <Label htmlFor="public-playlist">Make this playlist public</Label>
    </div>
  );
}
