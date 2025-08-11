import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

// Custom OpenAI-compatible endpoint configuration for Lexi models
const CUSTOM_API_BASE_URL = process.env.CUSTOM_API_BASE_URL || 'https://open-brain.xteo.com/';
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY || 'lexiAPI';

// Create an OpenAI-compatible provider with custom base URL for Lexi models
const customCompatibleProvider = createOpenAICompatible({
  baseURL: CUSTOM_API_BASE_URL,
  name: 'custom-openai',
  apiKey: CUSTOM_API_KEY,
});

// Production provider configuration with multiple models
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Default chat model - Grok 2 December version
        'chat-model': xai('grok-4-0709'),
        
        // Reasoning model with Groq's DeepSeek
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-4-0709'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        
        // Grok 4 - most advanced model (when available)
        'grok-4': xai('grok-4-0709'),
        
        // OpenAI model
        'openai-model': openai('gpt-5'),
        
        // Lexi specialized models
        'lexi': customCompatibleProvider('lexi'),
        'lexi-todo': customCompatibleProvider('todo'),
        'lexi-memory': customCompatibleProvider('memory'),
        'lexi-search': customCompatibleProvider('search'),
        
        // Utility models
        'title-model': openai('gpt-5-mini'),
        'artifact-model': openai('gpt-5-mini'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });