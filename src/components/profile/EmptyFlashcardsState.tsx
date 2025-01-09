import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";

export function EmptyFlashcardsState() {
  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500">No flashcards found</div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Create Flashcards</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Flashcards</DialogTitle>
          </DialogHeader>
          <CreateMultipleCards />
        </DialogContent>
      </Dialog>
    </div>
  );
}