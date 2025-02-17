
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
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

  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
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
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            Send to All Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
