import { Button } from "@/components/ui/button";

interface StudyHeaderProps {
  userEmail: string | undefined;
  onSignOut: () => void;
  folderName: string;
}

export function StudyHeader({ userEmail, onSignOut, folderName }: StudyHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-medium">{userEmail?.split('@')[0]}</div>
        <Button variant="outline" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-8">{folderName}</h1>
    </>
  );
}