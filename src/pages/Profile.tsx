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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreatePlaylistModal } from "@/components/playlist/CreatePlaylistModal";
import { PlaylistList } from "@/components/playlist/PlaylistList";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            {profile?.username && (
              <span className="text-muted-foreground">(@{profile.username})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsDialog />
          <SettingsDialog />
          <ProfileSettingsDialog />
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>

      {profile?.bio && (
        <p className="text-muted-foreground mb-8">{profile.bio}</p>
      )}

      <Tabs defaultValue="playlists" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="playlists">My Playlists</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="public">Public Playlists</TabsTrigger>
            <TabsTrigger value="friends">My Friends</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <AddFriendDialog />
            <Button 
              size="default" 
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Playlist
            </Button>
          </div>
        </div>

        <TabsContent value="playlists">
          <PlaylistList />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoriteFlashcards />
        </TabsContent>

        <TabsContent value="public">
          <PublicPlaylists />
        </TabsContent>

        <TabsContent value="friends">
          <div className="mt-4">
            <FriendsList />
          </div>
        </TabsContent>
      </Tabs>

      <CreatePlaylistModal 
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}