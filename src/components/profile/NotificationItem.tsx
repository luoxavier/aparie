
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { FriendRequestActions } from "./notifications/FriendRequestActions";
import { PlaylistNotification } from "./notifications/PlaylistNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [showFullMessage, setShowFullMessage] = useState(false);

  const handleFolderDeleted = () => {
    setIsExiting(true);
    setTimeout(() => {
      onMarkAsRead(id);
    }, 300);
  };

  const handleMessageClick = () => {
    if ((type === 'admin_update' || type === 'admin_message') && content?.message) {
      setShowFullMessage(true);
    }
  };

  return (
    <>
      <Card className={`relative transition-all duration-300 mx-2 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100'}`}>
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-4 max-w-full">
            {senderAvatar && (
              <img
                src={senderAvatar}
                alt={senderName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-medium truncate text-sm sm:text-base">{senderName}</p>
              {type === 'friend_request' && (
                <p className="text-xs sm:text-sm text-gray-600">
                  Sent you a friend request
                </p>
              )}
              {(type === 'shared_playlist' || type === 'folder_deleted') && (
                <p className="text-xs sm:text-sm text-gray-600">
                  {content?.message || "Shared a playlist with you"}
                </p>
              )}
              {(type === 'admin_update' || type === 'admin_message') && (
                <div 
                  onClick={handleMessageClick}
                  className="cursor-pointer hover:bg-gray-50 rounded-md p-1 sm:p-2 -m-1 sm:-m-2"
                >
                  <p className="font-semibold text-xs sm:text-sm">{content?.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {content?.message}
                  </p>
                  {content?.message && content.message.length > 100 && (
                    <p className="text-xs text-blue-500 mt-1">Click to read more</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              {type === 'friend_request' ? (
                <FriendRequestActions
                  id={id}
                  senderId={senderId}
                  senderName={senderName}
                  onMarkAsRead={onMarkAsRead}
                />
              ) : type === 'folder_deleted' ? (
                <PlaylistNotification
                  content={content}
                  senderId={senderId}
                  senderName={senderName}
                  onMarkAsRead={onMarkAsRead}
                  id={id}
                  onExit={() => setIsExiting(true)}
                />
              ) : type === 'shared_playlist' ? (
                <PlaylistNotification
                  content={content}
                  senderId={senderId}
                  senderName={senderName}
                  onMarkAsRead={onMarkAsRead}
                  id={id}
                  onExit={() => setIsExiting(true)}
                />
              ) : (
                <button
                  onClick={() => onMarkAsRead(id)}
                  className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 whitespace-nowrap"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFullMessage} onOpenChange={setShowFullMessage}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg mx-2">
          <DialogHeader>
            <DialogTitle>{content?.title || "Message"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {content?.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => onMarkAsRead(id)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
