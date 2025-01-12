import { Profile } from "@/types/database";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipientSelectProps {
  recipientId: string;
  setRecipientId: (value: string) => void;
  friends: Profile[];
}

export function RecipientSelect({ recipientId, setRecipientId, friends }: RecipientSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Create for</Label>
      <Select value={recipientId} onValueChange={setRecipientId}>
        <SelectTrigger>
          <SelectValue placeholder="Select recipient" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="self">Myself</SelectItem>
          {friends.map((friend) => (
            <SelectItem key={friend.id} value={friend.id}>
              {friend.display_name || friend.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}