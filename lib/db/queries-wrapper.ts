// Wrapper to use Supabase queries with old interface
import * as supabaseQueries from './queries-supabase';
import { generateUUID } from '@/lib/utils';

// Re-export functions that work directly
export const {
  getUser,
  createChat,
  createChatWithId,
  deleteChat,
  updateChatTitle,
  updateChatVisibility,
  createMessage,
  deleteMessagesByChatId,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  createSuggestion,
  getSuggestionsByDocumentId,
  resolveSuggestion,
} = supabaseQueries;

// Transform snake_case to camelCase for compatibility
export async function getChatById({ id }: { id: string }) {
  const chat = await supabaseQueries.getChatById(id);
  if (!chat) return null;
  
  return {
    id: chat.id,
    userId: chat.user_id,
    title: chat.title,
    visibility: chat.visibility,
    createdAt: chat.created_at,
    updatedAt: chat.updated_at,
  };
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const messages = await supabaseQueries.getMessagesByChatId(id);
  
  return messages.map(msg => ({
    id: msg.id,
    chatId: msg.chat_id,
    role: msg.role,
    content: msg.parts,
    parts: msg.parts,
    attachments: msg.attachments,
    createdAt: msg.created_at,
  }));
}

// Adapter functions for different signatures
export async function getChatsByUserId({ 
  id, 
  limit, 
  startingAfter, 
  endingBefore 
}: { 
  id: string; 
  limit?: number; 
  startingAfter?: string; 
  endingBefore?: string;
}) {
  const chats = await supabaseQueries.getChatsByUserId(id);
  
  // Apply pagination
  let result = chats;
  if (startingAfter) {
    const index = chats.findIndex(chat => chat.id === startingAfter);
    if (index >= 0) {
      result = chats.slice(index + 1);
    }
  }
  if (endingBefore) {
    const index = chats.findIndex(chat => chat.id === endingBefore);
    if (index >= 0) {
      result = chats.slice(0, index);
    }
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  
  return result;
}

export async function saveChat({
  id,
  userId,
  title,
  visibility = 'private',
}: {
  id?: string;
  userId: string;
  title: string;
  visibility?: 'public' | 'private';
}) {
  const chatId = id || generateUUID();
  // Need to create chat with specific ID
  const chat = await supabaseQueries.createChatWithId(chatId, userId, title);
  if (visibility !== 'private') {
    await supabaseQueries.updateChatVisibility(chat.id, visibility);
  }
  return chat;
}

export async function deleteChatById({ id }: { id: string }) {
  return supabaseQueries.deleteChat(id);
}

export async function updateChatVisiblityById({ 
  chatId, 
  visibility 
}: { 
  chatId: string; 
  visibility: 'public' | 'private';
}) {
  return supabaseQueries.updateChatVisibility(chatId, visibility);
}

export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id?: string;
    chatId: string;
    role: string;
    content?: any;
    parts?: any;
    attachments?: any[];
    createdAt?: Date;
  }>;
}) {
  const savedMessages = [];
  for (const message of messages) {
    const saved = await supabaseQueries.createMessage(
      message.chatId,
      message.role,
      message.parts || message.content,  // Use parts if available, otherwise content
      message.attachments || []
    );
    savedMessages.push(saved);
  }
  return savedMessages;
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  // Get all messages for the chat
  const messages = await supabaseQueries.getMessagesByChatId(chatId);
  
  // Filter messages after timestamp and delete them
  const messagesToDelete = messages.filter(m => new Date(m.created_at) > timestamp);
  
  // For now, we'll delete all messages and recreate the ones we want to keep
  // This is not ideal but works for the transition
  if (messagesToDelete.length > 0) {
    await supabaseQueries.deleteMessagesByChatId(chatId);
    
    // Recreate messages before timestamp
    const messagesToKeep = messages.filter(m => new Date(m.created_at) <= timestamp);
    for (const msg of messagesToKeep) {
      await supabaseQueries.createMessage(chatId, msg.role, msg.parts, msg.attachments);
    }
  }
}

export async function getMessageCountByUserId({ 
  id, 
  differenceInHours 
}: { 
  id: string; 
  differenceInHours?: number;
}): Promise<number> {
  const chats = await supabaseQueries.getChatsByUserId(id);
  let totalMessages = 0;
  
  for (const chat of chats) {
    const messages = await supabaseQueries.getMessagesByChatId(chat.id);
    
    // If differenceInHours is provided, only count recent messages
    if (differenceInHours) {
      const cutoffTime = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);
      const recentMessages = messages.filter(msg => 
        new Date(msg.created_at) > cutoffTime
      );
      totalMessages += recentMessages.length;
    } else {
      totalMessages += messages.length;
    }
  }
  
  return totalMessages;
}

export async function getMessageById({ id }: { id: string }) {
  // This is a simplified implementation
  // In production, you'd want to add a proper query for this
  return null;
}

export async function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
  // For now, just return the streamId
  // You might want to implement a streams table if needed
  return streamId;
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  // Return a dummy stream ID to prevent errors
  // In production, you'd track actual stream IDs
  return [`stream-${chatId}`];
}

// Document-related functions with adapted signatures
export async function getDocumentsById({ id }: { id: string }) {
  const doc = await supabaseQueries.getDocumentById(id);
  return doc ? [doc] : [];
}

export async function saveDocument({
  id,
  title,
  content,
  kind,
  userId,
}: {
  id?: string;
  title: string;
  content?: string;
  kind: 'text' | 'code' | 'image' | 'sheet';
  userId: string;
}) {
  return supabaseQueries.createDocument(userId, title, content, kind);
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  // For simplicity, just delete the document
  return supabaseQueries.deleteDocument(id);
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  return supabaseQueries.voteMessage(chatId, messageId, type === 'up');
}

export async function getVotesByChatId({ id }: { id: string }) {
  return supabaseQueries.getVotesByChatId(id);
}