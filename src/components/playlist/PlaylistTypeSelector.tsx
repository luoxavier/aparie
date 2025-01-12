import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, Globe, Users } from "lucide-react";

interface PlaylistTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlaylistTypeSelector({ value, onChange }: PlaylistTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Playlist Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <label className="flex items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary transition-colors">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <div>
              <div className="font-semibold">Public</div>
              <div className="text-sm text-muted-foreground">Anyone can view</div>
            </div>
          </div>
          <RadioGroupItem value="public" className="sr-only" />
        </label>

        <label className="flex items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary transition-colors">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <div>
              <div className="font-semibold">Private</div>
              <div className="text-sm text-muted-foreground">Share with specific users</div>
            </div>
          </div>
          <RadioGroupItem value="private" className="sr-only" />
        </label>

        <label className="flex items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary transition-colors">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <div>
              <div className="font-semibold">Partial Public</div>
              <div className="text-sm text-muted-foreground">Share via code</div>
            </div>
          </div>
          <RadioGroupItem value="partial-public" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}