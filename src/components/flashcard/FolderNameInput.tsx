import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FolderNameInputProps {
  folderName: string;
  setFolderName: (value: string) => void;
  label?: string;
}

export function FolderNameInput({ folderName, setFolderName, label = "Folder Name" }: FolderNameInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        placeholder="Enter name"
        required
      />
    </div>
  );
}