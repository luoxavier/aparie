import { FriendRequestItem } from "./FriendRequestItem";

interface FriendRequest {
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

interface FriendRequestsListProps {
  requests: FriendRequest[];
}

export function FriendRequestsList({ requests }: FriendRequestsListProps) {
  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <FriendRequestItem
          key={request.user_id}
          requesterId={request.user_id}
          requesterDisplayName={request.profiles.display_name}
          requesterAvatar={request.profiles.avatar_url}
        />
      ))}
    </div>
  );
}