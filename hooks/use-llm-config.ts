'use client';

import { startTransition, useOptimistic } from 'react';
import { saveLLMConfigAsCookie } from '@/app/(chat)/actions';
import { type LLMConfigType } from '@/lib/ai/llm-configs';

export function useLLMConfig({
  chatId,
  initialLLMConfig,
}: {
  chatId: string;
  initialLLMConfig: LLMConfigType;
}) {
  const [optimisticLLMConfig, setOptimisticLLMConfig] =
    useOptimistic(initialLLMConfig);

  const setLLMConfig = (config: LLMConfigType) => {
    startTransition(() => {
      setOptimisticLLMConfig(config);
      saveLLMConfigAsCookie(config);
    });
  };

  return {
    llmConfig: optimisticLLMConfig,
    setLLMConfig,
  };
}