
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

export default function ProfileEdit() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const initialBioRef = useRef("");
  const hasUnsavedChanges = useRef(false);
  const queryClient = useQueryClient();

  // Enhanced profile query with error handling and retry logic
  const { data: profile, isError: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, bio, display_name')
          .eq('id', user?.id)
          .single();
        
        if (error) {
          // Check for JWT errors
          if (error.message?.includes('JWT')) {
            const { data: session } = await supabase.auth.getSession();
            if (!session) {
              await signOut();
              throw new Error('Session expired. Please log in again.');
            }
          }
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!user?.id,
  });

  // Enhanced streaks query with error handling
  const { data: streakData, isError: streakError } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('current_streak, highest_streak')
          .eq('user_id', user?.id)
          .single();
        
        if (error) {
          if (error.message?.includes('JWT')) {
            const { data: session } = await supabase.auth.getSession();
            if (!session) {
              await signOut();
              throw new Error('Session expired. Please log in again.');
            }
          }
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error('Streak fetch error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
      initialBioRef.current = profile.bio;
    }
  }, [profile]);

  const handleBioUpdate = async () => {
    if (!user || !hasUnsavedChanges.current) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id);

      if (error) {
        if (error.message?.includes('JWT')) {
          const { data: session } = await supabase.auth.getSession();
          if (!session) {
            await signOut();
            toast({
              variant: "destructive",
              title: "Session expired",
              description: "Please log in again.",
            });
            return;
          }
        }
        throw error;
      }

      initialBioRef.current = bio;
      hasUnsavedChanges.current = false;
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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

  // Update bio only when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        handleBioUpdate();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (hasUnsavedChanges.current) {
        handleBioUpdate();
      }
    };
  }, [bio]);

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({
        title: "Signed out successfully",
        description: "Come back tomorrow to keep your streak!",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  if (profileError || streakError) {
    return (
      <div className="container mx-auto py-4 px-4 max-w-2xl">
        <div className="text-center space-y-4">
          <p className="text-red-500">Failed to load profile data. Please try again later.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}>
            Retry
          </Button>
          <ReturnHomeButton />
        </div>
      </div>
    );
  }

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
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <label 
              htmlFor="profile-picture" 
              className="absolute bottom-0 right-0 p-1 bg-primary hover:bg-primary/90 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <Edit className="h-4 w-4 text-primary-foreground" />
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Me</h2>
          <Textarea
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              hasUnsavedChanges.current = e.target.value !== initialBioRef.current;
            }}
            className="min-h-[120px]"
          />
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h2 className="text-lg font-semibold mb-4">Your Streaks</h2>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Streak</span>
            <span className="text-lg font-bold">{streakData?.current_streak || 0} days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Highest Streak</span>
            <span className="text-lg font-bold">{streakData?.highest_streak || 0} days</span>
          </div>
        </div>
      </div>
      <ReturnHomeButton />
    </div>
  );
}
