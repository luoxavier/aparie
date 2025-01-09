import { supabase } from "@/integrations/supabase/client";
import type { FriendProfile, FriendRequestError } from "@/types/friend-request";

export async function findUserByIdentifier(identifier: string): Promise<FriendProfile | null> {
  if (!identifier) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .or(`username.eq.${identifier},display_name.eq.${identifier}`)
    .maybeSingle();

  if (error) {
    console.error('Error finding user:', error);
    throw new Error('Failed to search for user');
  }

  return profile;
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

  // Check for existing connections in both directions using proper query syntax
  const { data: existingConnections, error: connectionError } = await supabase
    .from('friend_connections')
    .select('status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (connectionError) {
    console.error('Error checking connections:', connectionError);
    throw new Error('Failed to check existing connections');
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
  if (!userId || !friendId) {
    throw new Error('Invalid user information provided');
  }

  // Double-check for existing connections before inserting using proper query syntax
  const { data: existingConnections, error: checkError } = await supabase
    .from('friend_connections')
    .select('id')
    .or(`user_id.eq.${userId},user_id.eq.${friendId}`)
    .or(`friend_id.eq.${userId},friend_id.eq.${friendId}`);

  if (checkError) {
    console.error('Error checking existing connections:', checkError);
    throw new Error('Failed to check existing connections');
  }

  if (existingConnections && existingConnections.length > 0) {
    throw new Error('Connection already exists');
  }

  const { error: insertError } = await supabase
    .from('friend_connections')
    .insert([{
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    }]);

  if (insertError) {
    console.error('Error creating friend request:', insertError);
    throw new Error('Failed to send friend request');
  }

  const { error: notificationError } = await supabase
    .from('notifications')
    .insert([{
      recipient_id: friendId,
      sender_id: userId,
      type: 'friend_request',
      content: null
    }]);

  if (notificationError) {
    console.error('Error creating notification:', notificationError);
  }
}