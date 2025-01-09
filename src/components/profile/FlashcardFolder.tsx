import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ChevronDown } from "lucide-react";

interface Creator {
  display_name: string;
  username: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: Creator;
}

interface FlashcardFolderProps {
  title: string;
  flashcards: Flashcard[];
  onStudy: (cards: Flashcard[]) => void;
  showCreator?: boolean;
  creatorId?: string;
  folderName?: string;
}

export function FlashcardFolder({ 
  title, 
  flashcards, 
  onStudy, 
  showCreator = false,
  creatorId,
  folderName 
}: FlashcardFolderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleStudy = () => {
    onStudy(flashcards);
    navigate('/study-folder', { state: { flashcards, folderName: title } });
  };

  const handleFavorite = async () => {
    if (!user || !creatorId || !folderName) return;

    try {
      const { error } = await supabase
        .from('favorite_folders')
        .insert({
          user_id: user.id,
          creator_id: creatorId,
          folder_name: folderName
        });

      if (error) throw error;

      setIsFavorited(true);
      toast({
        title: "Success",
        description: "Folder added to favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add folder to favorites",
        variant: "destructive",
      });
    }
  };

  const isMyFlashcards = title.toLowerCase().includes('my flashcards');
  const isFromFriend = title.toLowerCase().includes('from');

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="text-left">
        <div className="flex items-center justify-between w-full pr-4">
          <span className="font-medium">
            {title}
            <span className="text-sm text-muted-foreground ml-2">
              ({flashcards.length} cards)
            </span>
          </span>
          <div className="flex items-center gap-2">
            {isFromFriend && !isFavorited && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                className={`transition-colors ${isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowCards(!showCards);
              }}
            >
              Show Cards
            </Button>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          {isMyFlashcards && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-secondary hover:bg-secondary/90 mb-4">
                  Create New Flashcard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Flashcards</DialogTitle>
                </DialogHeader>
                <CreateMultipleCards />
              </DialogContent>
            </Dialog>
          )}
          <Button 
            onClick={handleStudy}
            className="w-full"
            disabled={flashcards.length === 0}
          >
            Study These Cards
          </Button>
          {isFromFriend && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-secondary hover:bg-secondary/90">
                  Modify Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Modify Flashcards</DialogTitle>
                </DialogHeader>
                <CreateMultipleCards 
                  recipientId={user?.id}
                  existingCards={flashcards}
                  folderName={folderName}
                  onSave={() => {
                    toast({
                      title: "Success",
                      description: "Flashcards updated successfully",
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
          {showCards && flashcards.map((flashcard) => (
            <Card key={flashcard.id}>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                {showCreator && (
                  <p className="col-span-2"><strong>From:</strong> {flashcard.creator.display_name}</p>
                )}
                <p>{flashcard.front}</p>
                <p>{flashcard.back}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}