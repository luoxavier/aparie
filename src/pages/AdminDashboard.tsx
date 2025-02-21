
import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { FriendSearchInput } from "@/components/profile/FriendSearchInput";
import { X } from "lucide-react";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

interface UserProfile {
  id: string;
  display_name: string;
  username: string | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, display_name, username")
          .neq('id', user?.id);

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users.");
          return;
        }

        setUsers(profiles || []);
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        toast.error("Failed to load users.");
      }
    };

    fetchUsers();
  }, [user?.id]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const sendMessage = async (toAll: boolean) => {
    if (!user?.id || (!toAll && selectedUsers.length === 0) || !message.trim()) return;
    
    try {
      if (toAll) {
        // Create notifications for all users
        const notifications = users.map(recipient => ({
          type: 'admin_update',
          recipient_id: recipient.id,
          sender_id: user.id,
          content: {
            title,
            message: message.trim()
          }
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
        toast.success("Message sent to all users");
      } else {
        // Send to selected users
        const notifications = selectedUsers.map(recipient => ({
          type: 'admin_message',
          recipient_id: recipient.id,
          sender_id: user.id,
          content: {
            title,
            message: message.trim()
          }
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
        toast.success("Message sent successfully");
      }

      setTitle("");
      setMessage("");
      setSelectedUsers([]);
      setSearchTerm("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const handleUserSelect = (selectedUser: UserProfile) => {
    if (!selectedUsers.find(u => u.id === selectedUser.id)) {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
    setSearchTerm("");
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <PageContainer>
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <Input
              placeholder="Message Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
            <Textarea
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <FriendSearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search users by name or username..."
              />
              {searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.display_name} {user.username && `(@${user.username})`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                  >
                    <span>{selectedUser.display_name}</span>
                    <button
                      onClick={() => removeSelectedUser(selectedUser.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => sendMessage(true)}
              disabled={!message.trim()}
            >
              Send to All Users
            </Button>
            <Button 
              onClick={() => sendMessage(false)}
              disabled={selectedUsers.length === 0 || !message.trim()}
              variant="secondary"
            >
              Send to Selected Users
            </Button>
          </div>
        </div>

        <ReturnHomeButton />
      </div>
    </PageContainer>
  );
}
