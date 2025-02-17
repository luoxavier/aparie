import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { FriendRequestActions } from "./notifications/FriendRequestActions";
import { PlaylistNotification } from "./notifications/PlaylistNotification";
interface NotificationItemProps {
  id: string;
  senderName: string;
  senderAvatar?: string;
  type: string;
  senderId: string;
  content?: {
    playlistName?: string;
    message?: string;
    title?: string;
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
  const [isExiting, setIsExiting] = useState(false);
  const handleFolderDeleted = () => {
    setIsExiting(true);
    setTimeout(() => {
      onMarkAsRead(id);
    }, 300);
  };
  return <Card className={`relative transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100'}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {senderAvatar && <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full" />}
          <div className="flex-1 mx-[240px]">
            <p className="font-medium">{senderName}</p>
            {type === 'friend_request' && <p className="text-sm text-gray-600">
                Sent you a friend request
              </p>}
            {(type === 'shared_playlist' || type === 'folder_deleted') && <p className="text-sm text-gray-600">
                {content?.message || "Shared a playlist with you"}
              </p>}
            {(type === 'admin_update' || type === 'admin_message') && <div>
                <p className="font-semibold text-sm">{content?.title}</p>
                <p className="text-sm text-gray-600">
                  {content?.message}
                </p>
              </div>}
          </div>
          {type === 'friend_request' ? <FriendRequestActions id={id} senderId={senderId} senderName={senderName} onMarkAsRead={onMarkAsRead} /> : type === 'folder_deleted' ? <PlaylistNotification content={content} senderId={senderId} senderName={senderName} onMarkAsRead={onMarkAsRead} id={id} onExit={() => setIsExiting(true)} /> : type === 'shared_playlist' ? <PlaylistNotification content={content} senderId={senderId} senderName={senderName} onMarkAsRead={onMarkAsRead} id={id} onExit={() => setIsExiting(true)} /> : <button onClick={() => onMarkAsRead(id)} className="text-sm text-blue-500 hover:text-blue-600">
              Dismiss
            </button>}
        </div>
      </CardContent>
    </Card>;
}