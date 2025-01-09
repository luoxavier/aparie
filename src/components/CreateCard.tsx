import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface CreateCardProps {
  onSave: (front: string, back: string) => void;
}

export const CreateCard = ({ onSave }: CreateCardProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) {
      toast({
        title: "Error",
        description: "Please fill in both sides of the card",
        variant: "destructive",
      });
      return;
    }
    onSave(front, back);
    setFront("");
    setBack("");
    toast({
      title: "Success",
      description: "Card created successfully!",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
      <div>
        <Input
          placeholder="Front of card"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Input
          placeholder="Back of card"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-secondary">
        Create Card
      </Button>
    </form>
  );
};