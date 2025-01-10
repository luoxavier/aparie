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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Plus, UserPlus } from "lucide-react";

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
        <div className="flex items-center gap-4">
          <NotificationsDialog />
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="flashcards" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="friends">My Friends</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <AddFriendDialog />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Cards
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Flashcards</DialogTitle>
                </DialogHeader>
                <CreateMultipleCards />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="flashcards">
          <FlashcardsList />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoriteFlashcards />
        </TabsContent>

        <TabsContent value="friends">
          <div className="mt-4">
            <FriendsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}