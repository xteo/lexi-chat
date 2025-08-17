import { createClient } from '@/lib/supabase/server';
import { getEnvironmentConfig } from '@/lib/config/endpoints';

/**
 * Get the JWT token from the current Supabase session
 * This token will be passed to the Lexi backend services for authentication
 */
export async function getJWTToken(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.log('No active session found');
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
}

/**
 * Create headers with JWT authentication for Lexi API calls
 */
export async function createAuthHeaders(): Promise<HeadersInit> {
  const token = await getJWTToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get the appropriate API endpoint based on environment
 * @deprecated Use getEnvironmentConfig() from @/lib/config/endpoints instead
 */
export function getApiEndpoint(service: 'openbrain' | 'memory'): string {
  const config = getEnvironmentConfig();
  return service === 'openbrain' ? config.openbrain : config.memory;
}