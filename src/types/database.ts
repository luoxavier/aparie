export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  creator_id: string;
  recipient_id: string | null;
  folder_name: string | null;
  front: string;
  back: string;
  created_at: string;
  updated_at: string;
}

export interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  friend: Profile;
  user: Profile;
}