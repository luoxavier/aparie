
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdminMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  const checkAdminStatus = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Send message to all users
  const sendUpdate = async () => {
    if (!user?.id || !isAdmin || !message.trim()) return;
    
    setLoading(true);
    try {
      // Get all users except the sender
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id);

      if (profilesError) throw profilesError;

      // Create notifications for all users
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
          description: "Update sent to all users",
        });
      }

      setTitle("");
      setMessage("");
    } catch (error: any) {
      console.error('Error sending update:', error);
      toast({
        title: "Error",
        description: "Failed to send update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send direct message to specific user
  const sendDirectMessage = async (recipientId: string) => {
    if (!user?.id || !isAdmin || !message.trim()) return;
    
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
    } catch (error: any) {
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

  // Check admin status when component mounts
  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Send Admin Message</CardTitle>
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
          <div className="space-x-2">
            <Button 
              onClick={sendUpdate}
              disabled={loading || !message.trim()}
            >
              Send to All Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
