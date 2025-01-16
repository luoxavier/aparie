import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { FriendsList } from "@/components/profile/FriendsList";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { SettingsDialog } from "@/components/profile/SettingsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Users, Bell, PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name')
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
              <div className="flex items-center gap-2">
                {profile?.username && (
                  <span className="text-sm sm:text-base text-muted-foreground">(@{profile.username})</span>
                )}
              </div>
            </div>
            
            <SettingsDialog />
          </div>

          {/* Action Buttons Below Profile */}
          <div className="flex justify-start items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate('/friends')}
            >
              <Users className="h-5 w-5" />
            </Button>
            <NotificationsDialog />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate('/profile/edit')}
            >
              <User className="h-5 w-5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full flex items-center gap-2 bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">Create Cards</span>
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

        {/* Main Content */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <FlashcardsList />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <FavoriteFlashcards />
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="mb-4">
              <AddFriendDialog />
            </div>
            <FriendsList />
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            <PublicPlaylists />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}