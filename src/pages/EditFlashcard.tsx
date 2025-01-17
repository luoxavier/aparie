import { useParams } from "react-router-dom";
import { CreateCard } from "@/components/CreateCard";

export default function EditFlashcard() {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Flashcard</h1>
        <CreateCard flashcardId={id} />
      </div>
    </div>
  );
}