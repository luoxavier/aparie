import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { CreateFlashcardButton } from "@/components/profile/CreateFlashcardButton";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { ProfileSettingsDialog } from "@/components/profile/ProfileSettingsDialog";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { PlusCircle, User, Users } from "lucide-react";
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile?.display_name || 'Loading...'}</h1>
            <p className="text-sm text-gray-500">@{profile?.username || 'username'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                  Create Cards
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Cards</DialogTitle>
                </DialogHeader>
                <CreateMultipleCards />
              </DialogContent>
            </Dialog>
            <NotificationsDialog />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/friends')}
            >
              <Users className="h-5 w-5" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
        <div className="space-y-6">
          <FlashcardsList />
        </div>
        <div className="space-y-6">
          <FavoriteFlashcards />
          <PublicPlaylists />
        </div>
      </div>
    </div>
  );
}