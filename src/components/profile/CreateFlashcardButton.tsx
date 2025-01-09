import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCard } from "@/components/CreateCard";

export function CreateFlashcardButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Create a New Flashcard</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Flashcard</DialogTitle>
        </DialogHeader>
        <CreateCard />
      </DialogContent>
    </Dialog>
  );
}