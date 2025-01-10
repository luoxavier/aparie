import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Friend } from "../types";

interface RecipientSelectProps {
  selectedRecipient: string;
  setSelectedRecipient: (value: string) => void;
  friends?: Friend[];
  initialRecipientId?: string;
}

export function RecipientSelect({ 
  selectedRecipient, 
  setSelectedRecipient, 
  friends,
  initialRecipientId 
}: RecipientSelectProps) {
  if (initialRecipientId) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="recipient">Create For</Label>
      <Select
        value={selectedRecipient}
        onValueChange={setSelectedRecipient}
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