import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { SettingsDialog } from "@/components/profile/SettingsDialog";
import { FeedbackDialog } from "@/components/profile/FeedbackDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Users, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col space-y-4">
          {/* Top Section with Avatar and Settings */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Profile</h1>
                {profile?.username && (
                  <span className="text-sm sm:text-base text-muted-foreground">(@{profile.username})</span>
                )}
              </div>
            </div>
            
            {/* Settings in top right */}
            <SettingsDialog />
          </div>

          {/* Action Buttons Below Profile */}
          <div className="flex justify-start items-center gap-2 sm:gap-4">
            <AddFriendDialog />
            <NotificationsDialog />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <PlusCircle className="h-5 w-5" />
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

        {profile?.bio && (
          <p className="text-sm sm:text-base text-muted-foreground">{profile.bio}</p>
        )}

        {/* Main Content */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <FlashcardsList />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <FavoriteFlashcards />
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            <PublicPlaylists />
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-4 right-4">
        <FeedbackDialog />
      </div>
    </div>
  );
}