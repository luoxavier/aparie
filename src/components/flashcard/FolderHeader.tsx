import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FolderHeaderProps {
  folderName: string;
  onFolderNameChange: (value: string) => void;
}

export function FolderHeader({ folderName, onFolderNameChange }: FolderHeaderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="folderName">Folder Name</Label>
      <Input
        id="folderName"
        value={folderName}
        onChange={(e) => onFolderNameChange(e.target.value)}
        placeholder="Enter folder name"
        required
      />
    </div>
  );
}