import { supabase } from "@/integrations/supabase/client";
import type { FriendProfile, FriendRequestError } from "@/types/friend-request";

export async function findUserByIdentifier(identifier: string): Promise<FriendProfile | null> {
  // First try to find the user's email using the database function
  const { data: emailData, error: emailError } = await supabase
    .rpc('get_user_email_from_identifier', {
      identifier: identifier
    });

  if (emailError) {
    throw new Error('Failed to search for user');
  }

  if (!emailData) {
    return null;
  }

  // Now get the profile using the email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (await supabase.auth.getUser(emailData)).data.user?.id)
    .maybeSingle();

  if (profileError) {
    throw new Error('Failed to fetch user profile');
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

  const { data: existingConnection, error: connectionError } = await supabase
    .from('friend_connections')
    .select('status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (connectionError) {
    throw new Error('Failed to check existing connections');
  }

  if (existingConnection) {
    return existingConnection.status === 'accepted' 
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