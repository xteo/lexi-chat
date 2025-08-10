import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserType = 'guest' | 'regular';

export interface Session {
  user: {
    id: string;
    email?: string | null;
    type: UserType;
  };
}

export async function auth(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Determine user type based on email or metadata
  const isGuest = user.email?.startsWith('guest-') || user.user_metadata?.is_guest === true;

  // Return user in a format similar to NextAuth session
  return {
    user: {
      id: user.id,
      email: user.email,
      type: isGuest ? 'guest' : 'regular',
    },
  };
}

export async function requireAuth() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return session;
}