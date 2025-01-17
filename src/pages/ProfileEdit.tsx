import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const { user, signOut } = useAuth();
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

  const { data: streakData } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, highest_streak')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture",
      });
    }
  };

  const handleBioUpdate = async (bio: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bio",
      });
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div className="w-full max-w-sm">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Me</h2>
          <Textarea
            placeholder="Tell us about yourself..."
            defaultValue={profile?.bio || ""}
            onChange={(e) => handleBioUpdate(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {streakData && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h2 className="text-lg font-semibold mb-4">Your Streaks</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Streak</span>
              <span className="text-lg font-bold">{streakData.current_streak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Highest Streak</span>
              <span className="text-lg font-bold">{streakData.highest_streak} days</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
