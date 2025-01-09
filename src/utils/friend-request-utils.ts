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

  // Check for existing connections in both directions
  const { data: existingConnections, error: connectionError } = await supabase
    .from('friend_connections')
    .select('status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (connectionError && connectionError.code !== 'PGRST116') {
    console.error('Error checking connections:', connectionError);
    throw new Error('Failed to check existing connections');
  }

  if (existingConnections) {
    return {
      type: existingConnections.status === 'accepted' ? 'already_friends' : 'pending_request',
      message: existingConnections.status === 'accepted' 
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

  // First check if there's an existing connection in either direction
  const { data: existingConnection, error: checkError } = await supabase
    .from('friend_connections')
    .select('id, status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing connections:', checkError);
    throw new Error('Failed to check existing connections');
  }

  // If there's an existing connection, handle it appropriately
  if (existingConnection) {
    if (existingConnection.status === 'accepted') {
      throw new Error('You are already friends with this user');
    } else {
      throw new Error('A friend request is already pending');
    }
  }

  // If no existing connection, create a new one
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

  // Create notification for the friend request
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