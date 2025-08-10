/**
 * Supabase Server-Side Authentication Utilities
 * 
 * This module provides server-side authentication utilities for the Lexi web chat
 * application using Supabase Auth. Use these functions in Server Components,
 * Server Actions, and API routes.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, Session } from '@supabase/supabase-js';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Create a Supabase client for server-side operations
 * Use this in Server Components, Server Actions, and API routes
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The setAll method was called from a Server Component
            // This can be ignored if you have middleware refreshing user sessions
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user (server-side)
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get the current session (server-side)
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get current session:', error);
    return null;
  }
}

/**
 * Server action for signing in with email and password
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'No user returned from authentication' };
    }
    
    return { 
      success: true, 
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Server action for signing up with email and password
 */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Server action for signing out
 */
export async function signOut() {
  const supabase = createServerSupabaseClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Server action for resetting password
 */
export async function resetPassword(email: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Server action for updating password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Password update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if user is authenticated (utility function)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Redirect to login if not authenticated (utility function)
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Get user settings from the unified schema
 */
export async function getUserSettings(userId?: string) {
  const supabase = createServerSupabaseClient();
  const targetUserId = userId || (await getCurrentUser())?.id;
  
  if (!targetUserId) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', targetUserId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user settings:', error);
      return null;
    }
    
    // Return default settings if none exist
    if (!data) {
      return {
        user_id: targetUserId,
        speak_replies: false,
        streaming_enabled: true,
        voice_message_enabled: true,
        streaming_voice_enabled: true,
        ble_enabled: true,
        preferred_model: 'lexi',
        theme: 'system',
        settings_data: {},
      };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return null;
  }
}

/**
 * Update user settings in the unified schema
 */
export async function updateUserSettings(settings: Partial<{
  speak_replies: boolean;
  streaming_enabled: boolean;
  voice_message_enabled: boolean;
  streaming_voice_enabled: boolean;
  ble_enabled: boolean;
  preferred_model: string;
  theme: string;
  settings_data: Record<string, any>;
}>) {
  const supabase = createServerSupabaseClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Type exports for convenience
export type { User, Session } from '@supabase/supabase-js';