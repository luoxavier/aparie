
export interface FriendRequestError {
  type: 'not_found' | 'self_request' | 'already_friends' | 'pending_request' | 'server_error';
  message: string;
}

export interface FriendProfile {
  id: string;
}

export type SearchResults = FriendProfile[];
