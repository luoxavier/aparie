import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCard } from "@/components/CreateCard";

export function EmptyFlashcardsState() {
  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500">No flashcards found</div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Create a Flashcard</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Flashcard</DialogTitle>
          </DialogHeader>
          <CreateCard />
        </DialogContent>
      </Dialog>
    </div>
  );
}