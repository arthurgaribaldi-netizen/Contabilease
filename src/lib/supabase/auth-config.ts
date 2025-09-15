import { supabase } from '../supabase';

/**
 * Enhanced authentication configuration for production
 */

export interface AuthConfig {
  email: {
    enableSignup: boolean;
    confirmEmail: boolean;
    secureEmailChange: boolean;
    securePasswordChange: boolean;
  };
  providers: {
    google: boolean;
    github: boolean;
    magicLink: boolean;
  };
  security: {
    enableMFA: boolean;
    sessionTimeout: number; // in minutes
    maxFailedAttempts: number;
    lockoutDuration: number; // in minutes
  };
}

export const AUTH_CONFIG: AuthConfig = {
  email: {
    enableSignup: true,
    confirmEmail: true,
    secureEmailChange: true,
    securePasswordChange: true,
  },
  providers: {
    google: true,
    github: false,
    magicLink: true,
  },
  security: {
    enableMFA: true,
    sessionTimeout: 24 * 60, // 24 hours
    maxFailedAttempts: 5,
    lockoutDuration: 15, // 15 minutes
  },
};

// Authentication helpers
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email_confirm: AUTH_CONFIG.email.confirmEmail,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign in with magic link
  signInWithMagicLink: async (email: string, redirectTo?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Magic link error:', error);
      return { data: null, error };
    }
  },

  // Sign in with Google
  signInWithGoogle: async (redirectTo?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  updateProfile: async (updates: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error };
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Verify email
  verifyEmail: async (token: string, type: 'signup' | 'recovery' | 'invite') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Email verification error:', error);
      return { data: null, error };
    }
  },
};

// Session management
export const sessionManager = {
  // Check if session is valid and not expired
  isSessionValid: (session: any): boolean => {
    if (!session) return false;

    const now = Date.now();
    const sessionCreated = new Date(session.created_at).getTime();
    const sessionAge = now - sessionCreated;
    const maxAge = AUTH_CONFIG.security.sessionTimeout * 60 * 1000; // Convert to milliseconds

    return sessionAge < maxAge;
  },

  // Get session expiration time
  getSessionExpiration: (session: any): Date | null => {
    if (!session) return null;

    const sessionCreated = new Date(session.created_at);
    const expirationTime = new Date(
      sessionCreated.getTime() + AUTH_CONFIG.security.sessionTimeout * 60 * 1000
    );

    return expirationTime;
  },

  // Refresh session if needed
  refreshSessionIfNeeded: async (session: any) => {
    if (!session) return null;

    const expirationTime = sessionManager.getSessionExpiration(session);
    const now = new Date();

    // Refresh if session expires in less than 5 minutes
    if (expirationTime && now.getTime() > expirationTime.getTime() - 5 * 60 * 1000) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data.session;
      } catch (error) {
        console.error('Session refresh error:', error);
        return null;
      }
    }

    return session;
  },
};

// Error handling for auth operations
export const authErrorHandler = {
  // Parse Supabase auth errors into user-friendly messages
  parseError: (error: any): string => {
    if (!error) return 'An unexpected error occurred';

    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
      'User not found': 'Usuário não encontrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'User already registered': 'Este email já está cadastrado',
      'Signup is disabled': 'Cadastro está desabilitado no momento',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos',
      'Password reset limit exceeded': 'Limite de redefinição de senha excedido',
      'Session not found': 'Sessão expirada. Faça login novamente',
    };

    return errorMap[error.message] || error.message || 'Erro desconhecido';
  },

  // Check if error is recoverable
  isRecoverable: (error: any): boolean => {
    const recoverableErrors = [
      'Invalid login credentials',
      'Email not confirmed',
      'Password should be at least 6 characters',
      'Unable to validate email address: invalid format',
    ];

    return recoverableErrors.includes(error?.message);
  },
};
