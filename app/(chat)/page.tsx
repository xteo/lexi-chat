import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DEFAULT_LLM_CONFIG } from '@/lib/ai/llm-configs';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const llmConfigFromCookie = cookieStore.get('llm-config');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialLLMConfig={llmConfigFromCookie?.value || DEFAULT_LLM_CONFIG}
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialLLMConfig={llmConfigFromCookie?.value || DEFAULT_LLM_CONFIG}
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}