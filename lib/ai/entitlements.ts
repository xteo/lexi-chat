import type { UserType } from '@/lib/supabase/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 200,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'grok-4',
      'openai-model',
      'lexi',
      'lexi-todo',
      'lexi-memory',
      'lexi-search',
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'grok-4',
      'openai-model',
      'lexi',
      'lexi-todo',
      'lexi-memory',
      'lexi-search',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};