import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, List } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  id: string;
  senderName: string;
  senderAvatar?: string;
  type: string;
  senderId: string;
  content?: {
    playlistName?: string;
    message?: string;
  };
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ 
  id, 
  senderName, 
  senderAvatar, 
  type, 
  senderId,
  content,
  onMarkAsRead 
}: NotificationItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const handleFriendRequest = useMutation({
    mutationFn: async (action: 'accept' | 'deny') => {
      if (action === 'accept') {
        // First check if there's already a connection
        const { data: existingConnection, error: checkError } = await supabase
          .from('friend_connections')
          .select('id, status')
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${senderId}),and(user_id.eq.${senderId},friend_id.eq.${user?.id})`)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingConnection?.status === 'accepted') {
          throw new Error('You are already friends with this user');
        }

        // Create friend connection if none exists
        if (!existingConnection) {
          const { error: connectionError } = await supabase
            .from('friend_connections')
            .insert([{
              user_id: user?.id,
              friend_id: senderId,
              status: 'accepted'
            }]);

          if (connectionError) throw connectionError;
        } else {
          // Update existing connection to accepted
          const { error: updateError } = await supabase
            .from('friend_connections')
            .update({ status: 'accepted' })
            .eq('id', existingConnection.id);

          if (updateError) throw updateError;
        }

        // Mark notification as read
        onMarkAsRead(id);
      } else {
        // Just mark the notification as read for deny
        onMarkAsRead(id);
      }
    },
    onSuccess: (_, variables) => {
      setIsExiting(true);
      setTimeout(() => {
        toast({
          title: variables === 'accept' ? "Friend request accepted" : "Friend request denied",
          description: variables === 'accept' 
            ? `You are now friends with ${senderName}!` 
            : `Friend request from ${senderName} has been denied.`,
        });
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }, 300); // Wait for animation to complete
    },
    onError: (error: any) => {
      toast({
        title: "Error handling friend request",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handlePlaylistClick = () => {
    if (content?.playlistName) {
      setIsExiting(true);
      setTimeout(() => {
        onMarkAsRead(id);
        // Navigate to the playlist study page
        navigate(`/study/${senderId}/${content.playlistName}`);
      }, 300);
    }
  };

  return (
    <Card className={`relative transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100'}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {senderAvatar && (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            <p className="font-medium">{senderName}</p>
            {type === 'friend_request' && (
              <p className="text-sm text-gray-600">
                Sent you a friend request
              </p>
            )}
            {type === 'shared_playlist' && (
              <p className="text-sm text-gray-600">
                {content?.message || "Shared a playlist with you"}: {content?.playlistName}
              </p>
            )}
          </div>
          {type === 'friend_request' ? (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFriendRequest.mutate('accept')}
                className="h-8 w-8 text-green-500 hover:text-green-600"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFriendRequest.mutate('deny')}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlaylistClick}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}