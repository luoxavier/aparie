export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}