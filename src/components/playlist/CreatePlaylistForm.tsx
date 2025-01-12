import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FriendSelector } from "../profile/FriendSelector";
import { PlaylistTypeSelector } from "./PlaylistTypeSelector";
import { TagInput } from "./TagInput";

type PlaylistType = "public" | "private" | "partial-public";
type SharingType = "single" | "group" | "code";

interface CreatePlaylistFormProps {
  onComplete?: () => void;
}

export function CreatePlaylistForm({ onComplete }: CreatePlaylistFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlistType, setPlaylistType] = useState<PlaylistType>("private");
  const [sharingType, setSharingType] = useState<SharingType>("single");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allowModification, setAllowModification] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Create the playlist
      const { error: playlistError } = await supabase
        .from("playlists")
        .insert({
          creator_id: user.id,
          name,
          description,
          tags,
          is_public: playlistType === "public",
          share_code: playlistType === "partial-public" ? Math.random().toString(36).substring(7) : null,
        });

      if (playlistError) throw playlistError;

      // Handle permissions for private and partial-public playlists
      if (playlistType !== "public" && selectedFriendId) {
        const { error: permissionsError } = await supabase
          .from("playlist_permissions")
          .insert({
            playlist_name: name,
            creator_id: user.id,
            user_id: selectedFriendId,
            can_modify: allowModification,
          });

        if (permissionsError) throw permissionsError;
      }

      toast({
        title: "Success",
        description: "Playlist created successfully!",
      });

      onComplete?.();
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create playlist. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaylistTypeChange = (value: string) => {
    setPlaylistType(value as PlaylistType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PlaylistTypeSelector
        value={playlistType}
        onChange={handlePlaylistTypeChange}
      />

      <div className="space-y-4">
        <div>
          <Label>Playlist Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter playlist name"
            required
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter playlist description"
          />
        </div>

        <TagInput tags={tags} onChange={setTags} />

        {playlistType === "private" && (
          <Tabs value={sharingType} onValueChange={(value) => setSharingType(value as SharingType)}>
            <TabsList>
              <TabsTrigger value="single">Single User</TabsTrigger>
              <TabsTrigger value="group">Group</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="space-y-4">
              <FriendSelector
                selectedFriendId={selectedFriendId}
                onSelect={(friend) => setSelectedFriendId(friend.id)}
              />
            </TabsContent>
            <TabsContent value="group" className="space-y-4">
              <FriendSelector
                selectedFriendId={selectedFriendId}
                onSelect={(friend) => setSelectedFriendId(friend.id)}
              />
            </TabsContent>
          </Tabs>
        )}

        {(playlistType === "private" || playlistType === "partial-public") && (
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-modification"
              checked={allowModification}
              onCheckedChange={setAllowModification}
            />
            <Label htmlFor="allow-modification">
              Allow users to modify flashcards
            </Label>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          Create Playlist
        </Button>
      </div>
    </form>
  );
}