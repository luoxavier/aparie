import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RecipientModifyToggleProps {
  allowRecipientModify: boolean;
  setAllowRecipientModify: (value: boolean) => void;
}

export function RecipientModifyToggle({ 
  allowRecipientModify, 
  setAllowRecipientModify 
}: RecipientModifyToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="recipient-modify"
        checked={allowRecipientModify}
        onCheckedChange={(checked) => setAllowRecipientModify(checked as boolean)}
      />
      <Label htmlFor="recipient-modify" className="text-sm">
        Allow recipient to modify these flashcards (they cannot delete the playlist)
      </Label>
    </div>
  );
}