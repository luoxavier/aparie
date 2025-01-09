import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [searchUsername, setSearchUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Ensure profile exists
  const createProfileIfNeeded = async () => {
    if (!user) return;
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();
    
    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: user.id,
        username: user.email?.split('@')[0] // Default username from email
      });
    }
  };

  // Fetch user's flashcards
  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: async () => {
      await createProfileIfNeeded();
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('creator_id', user?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's friends
  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      await createProfileIfNeeded();
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          friend_id,
          profiles!friend_connections_friend_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data;
    },
  });

  // Search for users
  const searchUsers = async (username: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${username}%`)
      .neq('id', user?.id)
      .limit(5);

    if (error) throw error;
    return data;
  };

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      await createProfileIfNeeded(); // Ensure profile exists before sending request
      
      const { error } = await supabase
        .from('friend_connections')
        .insert([
          {
            user_id: user?.id,
            friend_id: friendId,
            status: 'pending'
          }
        ]);

      if (error) {
        toast({
          title: "Error sending friend request",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent",
        description: "They will be notified of your request.",
      });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>

      <Tabs defaultValue="flashcards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flashcards">My Flashcards</TabsTrigger>
          <TabsTrigger value="friends">My Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="space-y-4">
          {flashcards?.map((flashcard) => (
            <Card key={flashcard.id}>
              <CardContent className="p-4">
                <p><strong>Front:</strong> {flashcard.front}</p>
                <p><strong>Back:</strong> {flashcard.back}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Friend</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                />
                <div className="space-y-2">
                  {searchUsername && (
                    <Button
                      onClick={async () => {
                        const users = await searchUsers(searchUsername);
                        if (users && users.length > 0) {
                          await sendFriendRequest.mutateAsync(users[0].id);
                        } else {
                          toast({
                            title: "User not found",
                            description: "No user found with that username.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Send Friend Request
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends?.map((friend) => (
              <Card key={friend.friend_id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {friend.profiles.avatar_url && (
                      <img
                        src={friend.profiles.avatar_url}
                        alt={friend.profiles.username}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{friend.profiles.username}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}