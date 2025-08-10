import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  // Create a guest user with email/password
  const guestId = Math.random().toString(36).substring(7);
  const email = `guest-${guestId}@example.com`;
  const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Sign up the guest user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        is_guest: true,
      },
    },
  });
  
  if (signUpError) {
    console.error('Error creating guest user:', signUpError);
    return NextResponse.json({ error: 'Failed to create guest session' }, { status: 500 });
  }
  
  // Sign in the guest user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (signInError) {
    console.error('Error signing in guest user:', signInError);
    return NextResponse.json({ error: 'Failed to sign in guest' }, { status: 500 });
  }
  
  // Redirect to home
  return NextResponse.redirect(new URL('/', new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3001')));
}