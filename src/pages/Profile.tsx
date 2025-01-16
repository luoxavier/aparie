import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FriendsList } from "@/components/profile/FriendsList";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { SettingsDialog } from "@/components/profile/SettingsDialog";
import { ProfileSettingsDialog } from "@/components/profile/ProfileSettingsDialog";
import { FeedbackDialog } from "@/components/profile/FeedbackDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Plus, UserPlus, Bell } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
            {profile?.username && (
              <span className="text-muted-foreground">(@{profile.username})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Flashcards</DialogTitle>
              </DialogHeader>
              <CreateMultipleCards />
            </DialogContent>
          </Dialog>
          <NotificationsDialog />
          <AddFriendDialog />
          <SettingsDialog />
          <ProfileSettingsDialog />
        </div>
      </div>

      {profile?.bio && (
        <p className="text-muted-foreground mb-6 md:mb-8">{profile.bio}</p>
      )}

      <Tabs defaultValue="flashcards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="public">Public Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-6">
          <FlashcardsList />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <FavoriteFlashcards />
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <PublicPlaylists />
        </TabsContent>
      </Tabs>

      <FeedbackDialog />
    </div>
  );
}