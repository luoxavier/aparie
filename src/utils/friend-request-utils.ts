import { supabase } from "@/integrations/supabase/client";
import type { FriendProfile, FriendRequestError } from "@/types/friend-request";

export async function findUserByIdentifier(identifier: string): Promise<FriendProfile | null> {
  // First try to find the user's profile using username or display name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .or(`username.eq.${identifier},display_name.eq.${identifier}`)
    .maybeSingle();

  if (profileError) {
    throw new Error('Failed to search for user');
  }

  return profile;
}

export async function validateFriendRequest(userId: string, friendId: string): Promise<FriendRequestError | null> {
  if (friendId === userId) {
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
    throw new Error('Failed to check existing connections');
  }

  if (existingConnections && existingConnections.length > 0) {
    const connection = existingConnections[0];
    return connection.status === 'accepted' 
      ? { type: 'already_friends', message: 'You are already friends with this user.' }
      : { type: 'pending_request', message: 'A friend request is already pending.' };
  }

  return null;
}

export async function createFriendRequest(userId: string, friendId: string) {
  const { error: insertError } = await supabase
    .from('friend_connections')
    .insert([{
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    }]);

  if (insertError) {
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
    console.error('Failed to create notification:', notificationError);
  }
}