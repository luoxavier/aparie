import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardFolder } from "./FlashcardFolder";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";

export function FlashcardsList() {
  const { user } = useAuth();

  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          creator_id,
          recipient_id,
          playlist_name,
          front,
          back,
          is_public,
          recipient_can_modify,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .or(`creator_id.eq.${user.id},recipient_id.eq.${user.id},is_public.eq.true`);

      if (error) throw error;

      // Group flashcards by playlist_name
      const groupedFlashcards = data.reduce((acc: any, card) => {
        const key = `${card.creator_id}-${card.playlist_name}`;
        if (!acc[key]) {
          acc[key] = {
            creatorId: card.creator_id,
            playlistName: card.playlist_name,
            creator: card.creator,
            recipientCanModify: card.recipient_can_modify,
            isRecipient: card.recipient_id === user.id,
            flashcards: []
          };
        }
        acc[key].flashcards.push(card);
        return acc;
      }, {});

      return Object.values(groupedFlashcards);
    },
    enabled: !!user,
  });

  if (isLoading) return <div>Loading flashcards...</div>;

  if (!flashcards.length) {
    return <EmptyFlashcardsState />;
  }

  return (
    <div className="space-y-4">
      {flashcards.map((playlist: any) => (
        <FlashcardFolder
          key={`${playlist.creatorId}-${playlist.playlistName}`}
          title={playlist.playlistName}
          subtitle={`Created by ${playlist.creator.display_name}`}
          flashcards={playlist.flashcards}
          showCreator={true}
          creatorId={playlist.creatorId}
          playlistName={playlist.playlistName}
          recipientCanModify={playlist.recipientCanModify && playlist.isRecipient}
        />
      ))}
    </div>
  );
}