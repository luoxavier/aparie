
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateFlashcardButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="px-4 py-3">
      <Button
        onClick={onClick}
        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-base"
        size="lg"
      >
        <Plus className="h-5 w-5" />
        Create Cards
      </Button>
    </div>
  );
}
