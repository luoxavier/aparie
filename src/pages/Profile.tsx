import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FavoriteFlashcards } from "@/components/profile/FavoriteFlashcards";
import { PublicPlaylists } from "@/components/profile/PublicPlaylists";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { SettingsDialog } from "@/components/profile/SettingsDialog";
import { QuestsDialog } from "@/components/profile/QuestsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { PenLine, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { getBorderClass } from "@/utils/level-utils";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        toast({
          title: "Profile not found",
          description: "Please try logging out and back in",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
    retry: 1,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('level, xp, next_level_xp')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user stats:', error);
        toast({
          title: "Error",
          description: "Failed to load user stats",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        const defaultStats = {
          level: 1,
          xp: 0,
          next_level_xp: 100
        };

        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert([{ user_id: user?.id, ...defaultStats }]);

        if (insertError) {
          console.error('Error creating user stats:', insertError);
          throw insertError;
        }

        return defaultStats;
      }

      return data;
    },
    retry: 1,
  });

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  if (profileLoading || statsLoading) {
    return <div className="container mx-auto py-4 px-4 max-w-7xl">Loading...</div>;
  }

  if (!profile) {
    return <div className="container mx-auto py-4 px-4 max-w-7xl">Profile not found</div>;
  }

  const xpProgress = userStats ? (userStats.xp / userStats.next_level_xp) * 100 : 0;

  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className={`rounded-full overflow-hidden ${getBorderClass(userStats?.level)}`}>
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-12 h-12 object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-semibold">{profile?.display_name}</h1>
                </div>
                {userStats && (
                  <div className="flex flex-col gap-1 w-full min-w-[200px]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Level {userStats.level}</span>
                      <span className="text-muted-foreground">{userStats.xp}/{userStats.next_level_xp} XP</span>
                    </div>
                    <Progress value={xpProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
            <SettingsDialog />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigate('/friends')}
            >
              <Users className="h-5 w-5" />
            </Button>
            <NotificationsDialog />
            <QuestsDialog />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigate('/profile/edit')}
            >
              <User className="h-5 w-5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 sm:flex-none px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                >
                  <PenLine className="h-5 w-5 mr-2" />
                  <span>Create Cards</span>
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

        <Tabs defaultValue="cards" className="w-full">
          <div className="flex justify-center w-full">
            <TabsList className="w-full max-w-2xl px-4">
              <TabsTrigger value="cards" className="flex-1 px-8">Cards</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 px-8">Favorites</TabsTrigger>
              <TabsTrigger value="public" className="flex-1 px-8">Public</TabsTrigger>
            </TabsList>
          </div>

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
    </div>
  );
}
