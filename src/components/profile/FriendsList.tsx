import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CreateCard } from "@/components/CreateCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function FriendsList() {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null);

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      // Get friends where user is either user_id or friend_id
      const { data: connections, error } = await supabase
        .from('friend_connections')
        .select(`
          friend_id,
          user_id,
          profiles!friend_connections_friend_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;

      // Transform the data to get friend profiles regardless of which ID they are
      return connections.map(connection => {
        const isFriend = connection.friend_id === user?.id;
        return {
          id: isFriend ? connection.user_id : connection.friend_id,
          username: isFriend ? 
            connection.profiles.username : 
            connection.profiles.username,
          avatar_url: isFriend ? 
            connection.profiles.avatar_url : 
            connection.profiles.avatar_url
        };
      });
    },
  });

  const handleSaveCard = async (front: string, back: string) => {
    if (!selectedFriend) return;

    try {
      // Create the flashcard
      const { data: flashcard, error: flashcardError } = await supabase
        .from('flashcards')
        .insert([
          {
            creator_id: user?.id,
            front,
            back
          }
        ])
        .select()
        .single();

      if (flashcardError) throw flashcardError;

      // Create notification for the friend
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: selectedFriend.id,
            sender_id: user?.id,
            type: 'new_flashcard',
            content: {
              flashcard_id: flashcard.id,
              front,
              back
            }
          }
        ]);

      if (notificationError) throw notificationError;

      toast({
        title: "Success",
        description: `Flashcard sent to ${selectedFriend.username}!`,
      });

      setSelectedFriend(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends?.map((friend) => (
        <Card key={friend.id}>
          <CardContent className="p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedFriend(friend)}
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <div className="flex items-center space-x-4">
                    {friend.avatar_url && (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{friend.username}</h3>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Flashcard for {friend.username}</DialogTitle>
                </DialogHeader>
                <CreateCard onSave={handleSaveCard} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}