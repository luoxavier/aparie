import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";

export function CreateFlashcardButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Create New Flashcards</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Flashcards</DialogTitle>
        </DialogHeader>
        <CreateMultipleCards />
      </DialogContent>
    </Dialog>
  );
}