
/**
 * Helper utilities for Instagram OAuth with SendPulse
 */

export interface OAuthState {
  store_id: string;
  user_id: string;
  timestamp: number;
}

/**
 * Base64 encode the OAuth state object
 */
export function base64EncodeState(state: OAuthState): string {
  try {
    const stateJson = JSON.stringify(state);
    return btoa(stateJson);
  } catch (error) {
    console.error('Failed to encode OAuth state:', error);
    throw new Error('Failed to encode OAuth state');
  }
}

/**
 * Construct the SendPulse OAuth URL with proper parameters
 */
export function constructOAuthUrl(clientId: string, state: OAuthState): string {
  const redirectUri = 'https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback';
  const scope = 'chatbots,user_data';
  const responseType = 'code';
  
  const encodedState = base64EncodeState(state);
  
  const oauthUrl = new URL('https://login.sendpulse.com/oauth/authorize');
  oauthUrl.searchParams.set('client_id', clientId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('response_type', responseType);
  oauthUrl.searchParams.set('scope', scope);
  oauthUrl.searchParams.set('state', encodedState);
  
  return oauthUrl.toString();
}

/**
 * Validate that the user has a valid session and store
 */
export interface SessionValidation {
  isValid: boolean;
  user?: any;
  store?: any;
  error?: string;
}

export async function validateSupabaseSession(supabase: any): Promise<SessionValidation> {
  try {
    // Check user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData?.session?.user) {
      return {
        isValid: false,
        error: 'You must be logged in to connect Instagram. Please sign in first.'
      };
    }

    const user = sessionData.session.user;

    // Check user's store
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, user_id, name')
      .eq('user_id', user.id)
      .single();

    if (storeError || !storeData) {
      return {
        isValid: false,
        error: 'Store not found. Please complete seller onboarding first.'
      };
    }

    return {
      isValid: true,
      user,
      store: storeData
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate session. Please try again.'
    };
  }
}
