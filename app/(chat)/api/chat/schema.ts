import { z } from 'zod';

const textPartSchema = z.object({
  type: z.enum(['text']),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(['file']),
  mediaType: z.enum(['image/jpeg', 'image/png']),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(['user']),
    parts: z.array(partSchema),
  }),
  selectedChatModel: z.enum(['chat-model', 'chat-model-reasoning', 'grok-4', 'openai-model', 'lexi', 'lexi-todo', 'lexi-memory', 'lexi-search']),
  llmConfig: z.enum(['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'claude-opus-4-1', 'claude-sonnet-4', 'grok-4', 'grok-3', 'grok-3-mini']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
