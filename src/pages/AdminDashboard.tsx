
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { FriendSearchInput } from "@/components/profile/FriendSearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    }
  };

  const sendBroadcast = async () => {
    if (!user?.id || !message.trim()) return;
    
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id);

      if (profilesError) throw profilesError;

      const notifications = profiles?.map(profile => ({
        type: 'admin_update',
        recipient_id: profile.id,
        sender_id: user.id,
        content: {
          title,
          message: message.trim()
        }
      }));

      if (notifications?.length) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;

        toast({
          title: "Success",
          description: "Message sent to all users",
        });
        
        setTitle("");
        setMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendDirectMessage = async (recipientId: string) => {
    if (!user?.id || !message.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'admin_message',
          recipient_id: recipientId,
          sender_id: user.id,
          content: {
            title,
            message: message.trim()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setTitle("");
      setMessage("");
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="broadcast" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="broadcast" className="flex-1">Broadcast Message</TabsTrigger>
          <TabsTrigger value="direct" className="flex-1">Direct Message</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Message to All Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Message Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={sendBroadcast}
                disabled={loading || !message.trim()}
              >
                Send to All Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FriendSearchInput
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  searchUsers(value);
                }}
                placeholder="Search for a user..."
              />
              
              {searchResults.length > 0 && (
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-4">
                    {searchResults.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={profile.avatar_url}
                            alt={profile.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{profile.display_name}</p>
                            <p className="text-sm text-muted-foreground">@{profile.username}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => sendDirectMessage(profile.id)}
                          disabled={!message.trim() || loading}
                        >
                          Send Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Input
                placeholder="Message Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReturnHomeButton />
    </div>
  );
}
