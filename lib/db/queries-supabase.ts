import { createClient, } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type Chat = Database['public']['Tables']['chats']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];
type Suggestion = Database['public']['Tables']['suggestions']['Row'];

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getChatsByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }

  return data || [];
}

export async function getChatById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .maybeSingle();  // Use maybeSingle instead of single to avoid error when no rows

  if (error) {
    console.error('Error fetching chat:', error);
    return null;
  }

  return data;
}

export async function createChat(userId: string, title = 'New Chat') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    throw error;
  }

  return data;
}

export async function createChatWithId(id: string, userId: string, title = 'New Chat') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chats')
    .insert({ id, user_id: userId, title })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat with ID:', error);
    throw error;
  }

  return data;
}

export async function deleteChat(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}

export async function updateChatTitle(id: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', id);

  if (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
}

export async function updateChatVisibility(id: string, visibility: 'public' | 'private') {
  const supabase = await createClient();
  const { error } = await supabase
    .from('chats')
    .update({ visibility })
    .eq('id', id);

  if (error) {
    console.error('Error updating chat visibility:', error);
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function createMessage(
  chatId: string,
  role: string,
  parts: any,
  attachments: any = []
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      parts,
      attachments,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return data;
}

export async function deleteMessagesByChatId(chatId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error deleting messages:', error);
    throw error;
  }
}

export async function getDocumentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data;
}

export async function createDocument(
  userId: string,
  title: string,
  content?: string,
  kind: 'text' | 'code' | 'image' | 'sheet' = 'text'
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      title,
      content,
      kind,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }

  return data;
}

export async function updateDocument(
  id: string,
  updates: { title?: string; content?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function createSuggestion(
  userId: string,
  documentId: string,
  documentCreatedAt: string,
  originalText: string,
  suggestedText: string,
  description?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suggestions')
    .insert({
      user_id: userId,
      document_id: documentId,
      document_created_at: documentCreatedAt,
      original_text: originalText,
      suggested_text: suggestedText,
      description,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating suggestion:', error);
    throw error;
  }

  return data;
}

export async function getSuggestionsByDocumentId(documentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('document_id', documentId)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  return data || [];
}

export async function resolveSuggestion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('suggestions')
    .update({ is_resolved: true })
    .eq('id', id);

  if (error) {
    console.error('Error resolving suggestion:', error);
    throw error;
  }
}

export async function voteMessage(
  chatId: string,
  messageId: string,
  isUpvoted: boolean
) {
  const supabase = await createClient();
  
  // Try to update existing vote first
  const { error: updateError } = await supabase
    .from('votes')
    .update({ is_upvoted: isUpvoted })
    .eq('chat_id', chatId)
    .eq('message_id', messageId);

  // If no existing vote, create new one
  if (updateError) {
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        chat_id: chatId,
        message_id: messageId,
        is_upvoted: isUpvoted,
      });

    if (insertError) {
      console.error('Error voting on message:', insertError);
      throw insertError;
    }
  }
}

export async function getVotesByChatId(chatId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error fetching votes:', error);
    return [];
  }

  return data || [];
}