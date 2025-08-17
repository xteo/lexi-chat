export const DEFAULT_LLM_CONFIG: string = 'gpt-5';

export interface LLMConfig {
  id: string;
  label: string;
  description: string;
}

export const llmConfigs: Array<LLMConfig> = [
  {
    id: 'gpt-5',
    label: 'GPT 5',
    description: 'OpenAI\'s most advanced model',
  },
  {
    id: 'gpt-5-mini',
    label: 'GPT 5 Mini',
    description: 'Smaller, faster OpenAI model',
  },
  {
    id: 'gpt-5-nano',
    label: 'GPT 5 Nano',
    description: 'Ultra-compact OpenAI model',
  },
  {
    id: 'gpt-4o',
    label: 'GPT 4o',
    description: 'OpenAI GPT-4 Omni model',
  },
  {
    id: 'claude-opus-4-1',
    label: 'Opus 4.1',
    description: 'Anthropic\'s most capable model',
  },
  {
    id: 'claude-sonnet-4',
    label: 'Sonnet 4',
    description: 'Anthropic\'s balanced model',
  },
  {
    id: 'grok-4',
    label: 'Grok 4',
    description: 'xAI\'s most advanced model',
  },
  {
    id: 'grok-3',
    label: 'Grok 3',
    description: 'xAI\'s capable model',
  },
  {
    id: 'grok-3-mini',
    label: 'Grok 3 Mini',
    description: 'xAI\'s efficient model',
  },
];

export type LLMConfigType = typeof llmConfigs[number]['id'];