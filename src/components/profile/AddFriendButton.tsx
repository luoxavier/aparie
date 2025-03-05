
import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function AddFriendButton() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchResults([]);
      
      // Search by display_name or username
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .neq('id', user?.id)
        .limit(5);
      
      if (error) throw error;
      
      // Filter out users that are already friends
      if (data.length > 0) {
        const { data: connections, error: connectionsError } = await supabase
          .from('friend_connections')
          .select('friend_id, status')
          .eq('user_id', user?.id)
          .in('friend_id', data.map(profile => profile.id));
        
        if (connectionsError) throw connectionsError;
        
        const friendIds = new Set();
        connections.forEach(conn => friendIds.add(conn.friend_id));
        
        setSearchResults(data.map(profile => ({
          ...profile,
          isFriend: friendIds.has(profile.id)
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string, friendName: string) => {
    try {
      setIsSendingRequest(true);
      
      // Check if there's already a friend connection
      const { data: existingConnection, error: checkError } = await supabase
        .from('friend_connections')
        .select('id, status')
        .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingConnection?.status === 'accepted') {
        toast({ 
          title: "Already friends",
          description: `You are already friends with ${friendName}`
        });
        return;
      }
      
      if (existingConnection?.status === 'pending') {
        toast({
          title: "Request pending",
          description: `A friend request with ${friendName} is already pending`
        });
        return;
      }
      
      // Create friend connection
      const { error: connectionError } = await supabase
        .from('friend_connections')
        .insert([{
          user_id: user?.id,
          friend_id: friendId,
          status: 'pending'
        }]);
      
      if (connectionError) throw connectionError;
      
      // Create notification for the recipient
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          sender_id: user?.id,
          recipient_id: friendId,
          type: 'friend_request',
          read: false
        }]);
      
      if (notificationError) throw notificationError;
      
      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${friendName}`
      });
      
      // Update search results to show pending state
      setSearchResults(prev => prev.map(profile => 
        profile.id === friendId 
          ? { ...profile, isFriend: true } 
          : profile
      ));
    } catch (error: any) {
      toast({
        title: "Error sending friend request",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="default"
        className="mb-4"
        data-add-friend-button="true"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add Friend
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by name or username"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                variant="secondary" 
                disabled={isSearching || !searchTerm}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            {isSearching ? (
              <div className="text-center py-4">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      {user.avatar_url && (
                        <img 
                          src={user.avatar_url} 
                          alt={user.display_name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{user.display_name}</p>
                        {user.username && (
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={user.isFriend ? "secondary" : "default"}
                      disabled={user.isFriend || isSendingRequest}
                      onClick={() => sendFriendRequest(user.id, user.display_name)}
                    >
                      {user.isFriend ? "Pending" : "Send Request"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
