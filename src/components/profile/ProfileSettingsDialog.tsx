import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function ProfileSettingsDialog() {
  const { user, signOut } = useAuth();
  const [bio, setBio] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user streak data with error handling
  const { data: streakData } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('current_streak, highest_streak')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching streak data:', error);
          throw error;
        }
        return data;
      } catch (error: any) {
        if (error.message?.includes('JWT')) {
          const { data: session } = await supabase.auth.getSession();
          if (!session) {
            await signOut();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw error;
      }
    },
    enabled: !!user?.id && isOpen,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch current profile data with error handling
  const { data: profile, isError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        return data;
      } catch (error: any) {
        if (error.message?.includes('JWT')) {
          const { data: session } = await supabase.auth.getSession();
          if (!session) {
            await signOut();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw error;
      }
    },
    enabled: !!user?.id && isOpen,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Update bio state when profile data is loaded
  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
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

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload profile picture.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBioUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Bio updated",
        description: "Your bio has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating bio:', error);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bio.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      await signOut();
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account.",
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && bio !== profile?.bio) {
      handleBioUpdate();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isError ? (
            <div className="text-center text-red-500">
              Failed to load profile data. Please try again later.
            </div>
          ) : (
            <>
              {streakData && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
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

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => signOut()}
              >
                Log Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}