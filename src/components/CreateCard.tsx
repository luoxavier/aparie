import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateCardProps {
  recipientId?: string;
  onSave?: (front: string, back: string) => void;
  flashcardId?: string;
}

export function CreateCard({ recipientId, onSave, flashcardId }: CreateCardProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create flashcards",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating flashcard with recipient_id:', recipientId); // Debug log
      const { error } = await supabase
        .from('flashcards')
        .insert([
          {
            front,
            back,
            creator_id: user.id,
            recipient_id: recipientId || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard created successfully",
      });

      // Call onSave if provided
      if (onSave) {
        onSave(front, back);
      }

      // Clear the form
      setFront("");
      setBack("");
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the front text"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Input
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the back text"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Create Flashcard
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
