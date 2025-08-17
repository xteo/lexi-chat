export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  label: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'lexi',
    label: 'Lexi',
    description: 'Lexi General Agent',
  },
  {
    id: 'lexi-todo',
    label: 'Lexi Todo',
    description: 'Lexi focused on todo management',
  },
  {
    id: 'lexi-memory',
    label: 'Lexi Memory',
    description: 'Lexi with enhanced memory capabilities',
  },
  {
    id: 'lexi-search',
    label: 'Lexi Search',
    description: 'Lexi optimized for search tasks',
  },
];