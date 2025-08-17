'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
} from './icons';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { llmConfigs, type LLMConfigType } from '@/lib/ai/llm-configs';

export function LLMConfigSelector({
  chatId,
  className,
  selectedLLMConfig,
}: {
  chatId: string;
  selectedLLMConfig: LLMConfigType;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  const { llmConfig, setLLMConfig } = useLLMConfig({
    chatId,
    initialLLMConfig: selectedLLMConfig,
  });

  const selectedConfig = useMemo(
    () => llmConfigs.find((config) => config.id === llmConfig),
    [llmConfig],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="llm-config-selector"
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
        >
          {selectedConfig?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {llmConfigs.map((config) => (
          <DropdownMenuItem
            data-testid={`llm-config-selector-item-${config.id}`}
            key={config.id}
            onSelect={() => {
              setLLMConfig(config.id);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={config.id === llmConfig}
          >
            <div className="flex flex-col gap-1 items-start">
              {config.label}
              {config.description && (
                <div className="text-xs text-muted-foreground">
                  {config.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}