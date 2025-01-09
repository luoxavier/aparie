import { NotificationItem } from "./NotificationItem";

interface Notification {
  id: string;
  type: string;
  sender: {
    display_name: string;
    avatar_url?: string;
  };
}

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  return (
    <div className="space-y-4">
      {notifications?.map((notification) => (
        <NotificationItem
          key={notification.id}
          id={notification.id}
          senderName={notification.sender.display_name}
          senderAvatar={notification.sender.avatar_url}
          type={notification.type}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}