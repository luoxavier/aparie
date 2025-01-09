import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FriendsList } from "@/components/profile/FriendsList";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          {profile?.username && (
            <span className="text-muted-foreground">(@{profile.username})</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <NotificationsDialog />
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="flashcards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flashcards">My Flashcards</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="friends">My Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <FlashcardsList />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoriteFlashcards />
        </TabsContent>

        <TabsContent value="friends">
          <AddFriendDialog />
          <div className="mt-4">
            <FriendsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}