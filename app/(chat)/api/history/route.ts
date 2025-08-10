import { auth } from '@/lib/supabase/auth';
import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries-supabase';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return new ChatSDKError(
      'bad_request:api',
      'Only one of starting_after or ending_before can be provided.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const chats = await getChatsByUserId(session.user.id);
    
    // Apply pagination
    let filteredChats = chats;
    
    if (endingBefore) {
      const index = chats.findIndex(chat => chat.id === endingBefore);
      if (index > 0) {
        filteredChats = chats.slice(0, index);
      }
    } else if (startingAfter) {
      const index = chats.findIndex(chat => chat.id === startingAfter);
      if (index >= 0) {
        filteredChats = chats.slice(index + 1);
      }
    }
    
    // Apply limit
    const paginatedChats = limit ? filteredChats.slice(0, limit) : filteredChats;

    return Response.json({
      chats: paginatedChats,
      hasMore: filteredChats.length > limit,
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new ChatSDKError('bad_request:database', 'Failed to get chats').toResponse();
  }
}