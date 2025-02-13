import { supabase } from "@/integrations/supabase/client";
import type { FriendProfile, FriendRequestError, SearchResults } from "@/types/friend-request";

export async function findUserByIdentifier(identifier: string): Promise<SearchResults> {
  if (!identifier) return [];

  const searchPattern = `%${identifier}%`;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id')
    .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`);

  if (error) {
    console.error('Error finding user:', error);
    throw new Error('Failed to search for user');
  }

  return profiles || [];
}

export async function validateFriendRequest(userId: string, friendId: string): Promise<FriendRequestError | null> {
  if (!userId || !friendId) {
    return {
      type: 'not_found',
      message: 'Invalid user information provided.'
    };
  }

  if (userId === friendId) {
    return {
      type: 'self_request',
      message: 'You cannot send a friend request to yourself.'
    };
  }

  // Check for existing connections in both directions
  const { data: existingConnections, error: connectionError } = await supabase
    .from('friend_connections')
    .select('status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (connectionError) {
    console.error('Error checking connections:', connectionError);
    return {
      type: 'server_error',
      message: 'Failed to check existing connections'
    };
  }

  if (existingConnections && existingConnections.length > 0) {
    const connection = existingConnections[0];
    return {
      type: connection.status === 'accepted' ? 'already_friends' : 'pending_request',
      message: connection.status === 'accepted' 
        ? 'You are already friends with this user.'
        : 'A friend request is already pending.'
    };
  }

  return null;
}

export async function createFriendRequest(userId: string, friendId: string) {
  const validationError = await validateFriendRequest(userId, friendId);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const { error: insertError } = await supabase
    .from('friend_connections')
    .insert([{
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    }]);

  if (insertError) {
    if (insertError.code === '23505') {
      throw new Error('A friend request already exists between you and this user');
    }
    console.error('Error creating friend request:', insertError);
    throw new Error('Failed to send friend request');
  }

  // Create notification for the friend request
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert([{
      recipient_id: friendId,
      sender_id: userId,
      type: 'friend_request',
      content: { message: 'sent you a friend request' }
    }]);

  if (notificationError) {
    console.error('Error creating notification:', notificationError);
  }
}
