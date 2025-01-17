import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

export default function FriendProfile() {
  const { user } = useAuth();
  const { id } = useParams();

  const { data: friendProfile } = useQuery({
    queryKey: ['friendProfile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, display_name')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{friendProfile?.display_name || "Friend's Profile"}</h1>
      {friendProfile?.avatar_url && (
        <img
          src={friendProfile.avatar_url}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
      )}
      <p className="text-sm text-muted-foreground">{friendProfile?.bio || "No bio available."}</p>
      <ReturnHomeButton />
    </div>
  );
}