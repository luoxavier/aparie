import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationItemProps {
  id: string;
  senderName: string;
  senderAvatar?: string;
  type: string;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ id, senderName, senderAvatar, type, onMarkAsRead }: NotificationItemProps) {
  return (
    <Card className="relative">
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
            {type === 'new_flashcard' && (
              <p className="text-sm text-gray-600">
                Created a new flashcard for you
              </p>
            )}
            {type === 'friend_request' && (
              <p className="text-sm text-gray-600">
                Sent you a friend request
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(id)}
          >
            Mark as read
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}