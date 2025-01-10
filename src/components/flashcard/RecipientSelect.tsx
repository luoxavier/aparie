import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Friend {
  id: string;
  display_name: string;
}

interface RecipientSelectProps {
  selectedRecipient: string;
  onRecipientChange: (value: string) => void;
  friends?: Friend[];
}

export function RecipientSelect({ selectedRecipient, onRecipientChange, friends }: RecipientSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="recipient">Create For</Label>
      <Select
        value={selectedRecipient}
        onValueChange={onRecipientChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recipient" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="myself">Myself</SelectItem>
          {friends?.map((friend) => (
            <SelectItem key={friend.id} value={friend.id}>
              {friend.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}