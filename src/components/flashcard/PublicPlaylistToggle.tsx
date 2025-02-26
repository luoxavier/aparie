
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PublicPlaylistToggleProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

export function PublicPlaylistToggle({ isPublic, setIsPublic }: PublicPlaylistToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="public-playlist"
        checked={isPublic}
        onCheckedChange={setIsPublic}
      />
      <Label htmlFor="public-playlist">Make this playlist public</Label>
    </div>
  );
}
