import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getEnvironmentConfig } from '@/lib/config/endpoints';

/**
 * Create a Lexi provider with dynamic JWT authentication and LLM config
 * The JWT token is passed via headers at the API route level
 */
export function createLexiProvider(jwtToken?: string, llmConfig?: string) {
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
    fetch: async (url, init) => {
      // Modify the request body to include llm_config if provided
      if (llmConfig && init?.body) {
        const body = JSON.parse(init.body as string);
        body.llm_config = llmConfig;
        init.body = JSON.stringify(body);
      }
      return fetch(url, init);
    },
  });
}

/**
 * Get the Lexi provider configuration for different models
 */
export function getLexiModels(jwtToken?: string, llmConfig?: string) {
  const provider = createLexiProvider(jwtToken, llmConfig);
  
  return {
    'lexi': provider('lexi'),
    'lexi-todo': provider('todo'),
    'lexi-memory': provider('memory'),
    'lexi-search': provider('search'),
  };
}