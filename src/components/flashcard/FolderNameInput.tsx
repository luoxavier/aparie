import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FolderNameInputProps {
  folderName: string;
  setFolderName: (value: string) => void;
}

export function FolderNameInput({ folderName, setFolderName }: FolderNameInputProps) {
  return (
    <div className="space-y-2">
      <Label>Folder Name</Label>
      <Input
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        placeholder="Enter folder name"
        required
      />
    </div>
  );
}