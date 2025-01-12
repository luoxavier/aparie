import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePlaylistForm } from "./CreatePlaylistForm";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CreatePlaylistModal({ 
  isOpen, 
  onOpenChange,
  onComplete 
}: CreatePlaylistModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        <CreatePlaylistForm onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
}