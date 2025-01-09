import { Button } from "@/components/ui/button";

interface StudyModeSelectorProps {
  onModeSelect: (mode: "normal" | "infinite") => void;
  folderName: string;
}

export function StudyModeSelector({ onModeSelect, folderName }: StudyModeSelectorProps) {
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">{folderName}</h1>
      <div className="space-y-4">
        <Button 
          className="w-full h-24 text-xl"
          onClick={() => onModeSelect("normal")}
        >
          Study Mode
        </Button>
        <Button 
          className="w-full h-24 text-xl"
          variant="secondary"
          onClick={() => onModeSelect("infinite")}
        >
          Infinite Mode
        </Button>
      </div>
    </div>
  );
}