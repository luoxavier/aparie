
import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  display_name: string;
  username: string | null;
  is_admin?: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, username");

        const { data: adminUsers, error: adminError } = await supabase
          .from("admin_users")
          .select("id");

        if (profilesError || adminError) {
          console.error("Error fetching users:", profilesError || adminError);
          toast.error("Failed to load users.");
          return;
        }

        const adminIds = new Set(adminUsers?.map(admin => admin.id));
        const usersWithAdmin = (profiles || []).map(profile => ({
          id: profile.id,
          display_name: profile.display_name,
          username: profile.username,
          is_admin: adminIds.has(profile.id)
        }));

        setUsers(usersWithAdmin);
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        toast.error("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePromote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_users")
        .insert([{ id }]);

      if (error) {
        console.error("Error promoting user:", error);
        toast.error("Failed to promote user.");
      } else {
        setUsers(users.map(user => user.id === id ? { ...user, is_admin: true } : user));
        toast.success("User promoted to admin!");
      }
    } catch (err) {
      console.error("Unexpected error promoting user:", err);
      toast.error("Failed to promote user.");
    }
  };

  const handleDemote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error demoting user:", error);
        toast.error("Failed to demote user.");
      } else {
        setUsers(users.map(user => user.id === id ? { ...user, is_admin: false } : user));
        toast.success("User demoted from admin!");
      }
    } catch (err) {
      console.error("Unexpected error demoting user:", err);
      toast.error("Failed to demote user.");
    }
  };

  const sendMessage = async (toAll: boolean) => {
    if (!user?.id || (!toAll && !selectedUserId) || !message.trim()) return;
    
    try {
      if (toAll) {
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

          toast.success("Message sent to all users");
        }
      } else if (selectedUserId) {
        // Send to specific user
        const { error } = await supabase
          .from('notifications')
          .insert({
            type: 'admin_message',
            recipient_id: selectedUserId,
            sender_id: user.id,
            content: {
              title,
              message: message.trim()
            }
          });

        if (error) throw error;
        toast.success("Message sent successfully");
      }

      setTitle("");
      setMessage("");
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  return (
    <PageContainer>
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {isLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Display Name</th>
                      <th className="py-2 px-4 border-b">Username</th>
                      <th className="py-2 px-4 border-b">Is Admin</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{user.id}</td>
                        <td className="py-2 px-4 border-b">{user.display_name}</td>
                        <td className="py-2 px-4 border-b">{user.username}</td>
                        <td className="py-2 px-4 border-b">{user.is_admin ? "Yes" : "No"}</td>
                        <td className="py-2 px-4 border-b">
                          {!user.is_admin ? (
                            <Button onClick={() => handlePromote(user.id)} variant="secondary">
                              Promote
                            </Button>
                          ) : (
                            <Button onClick={() => handleDemote(user.id)} variant="destructive">
                              Demote
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messaging">
            <div className="space-y-4 max-w-2xl">
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
              <div className="space-y-2">
                <select 
                  className="w-full p-2 border rounded-md mb-4"
                  onChange={(e) => setSelectedUserId(e.target.value || null)}
                  value={selectedUserId || ""}
                >
                  <option value="">Select a user (optional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name}
                    </option>
                  ))}
                </select>
                <div className="space-x-2">
                  <Button 
                    onClick={() => sendMessage(true)}
                    disabled={!message.trim()}
                  >
                    Send to All Users
                  </Button>
                  <Button 
                    onClick={() => sendMessage(false)}
                    disabled={!selectedUserId || !message.trim()}
                    variant="secondary"
                  >
                    Send to Selected User
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
