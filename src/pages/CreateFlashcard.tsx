import { CreateCard } from "@/components/CreateCard";

export default function CreateFlashcard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Flashcard</h1>
        <CreateCard />
      </div>
    </div>
  );
}