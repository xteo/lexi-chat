import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getEnvironmentConfig } from '@/lib/config/endpoints';

/**
 * Create a Lexi provider with dynamic JWT authentication
 * The JWT token is passed via headers at the API route level
 */
export function createLexiProvider(jwtToken?: string) {
  const config = getEnvironmentConfig();
  const baseURL = config.openbrain;
  
  // If no JWT token is provided, use a placeholder
  // The actual JWT will be injected in the API route
  const apiKey = jwtToken || 'jwt-will-be-injected';
  
  return createOpenAICompatible({
    baseURL: baseURL,  // The SDK will append /chat/completions automatically
    name: 'lexi-provider',
    apiKey,
    headers: jwtToken ? {
      'Authorization': `Bearer ${jwtToken}`,
    } : undefined,
  });
}

/**
 * Get the Lexi provider configuration for different models
 */
export function getLexiModels(jwtToken?: string) {
  const provider = createLexiProvider(jwtToken);
  
  return {
    'lexi': provider('lexi'),
    'lexi-todo': provider('todo'),
    'lexi-memory': provider('memory'),
    'lexi-search': provider('search'),
  };
}