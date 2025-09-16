import { logger } from '../logger';
import { createServerClient } from '../supabase';

/**
 * Security configurations for Supabase in production
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  AUTH_ATTEMPTS: {
    max: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  API_CALLS: {
    max: 100,
    window: 60 * 1000, // 1 minute
  },
  PASSWORD_RESET: {
    max: 3,
    window: 60 * 60 * 1000, // 1 hour
  },
};

// CORS configuration
export const CORS_ORIGINS = [
  'https://contabilease.vercel.app',
  'https://www.contabilease.com',
  'https://contabilease.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Database security functions
export const SECURITY_FUNCTIONS = {
  // Check if user can access resource
  canAccessResource: async (userId: string, resourceId: string, resourceType: string) => {
    const supabase = createServerClient();

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .eq('resource_type', resourceType)
        .single();

      if (error) {
        await logger.error(
          'Permission check error',
          { component: 'security', operation: 'canAccessResource' },
          error as Error
        );
        return false;
      }

      return !!data;
    } catch (error) {
      await logger.error(
        'Permission check failed',
        { component: 'security', operation: 'canAccessResource' },
        error as Error
      );
      return false;
    }
  },

  // Log security events
  logSecurityEvent: async (event: {
    userId?: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }) => {
    const supabase = createServerClient();

    try {
      const { error } = await supabase.from('security_logs').insert({
        user_id: event.userId,
        event_type: event.eventType,
        severity: event.severity,
        details: event.details,
        ip_address: event.ip,
        user_agent: event.userAgent,
        created_at: new Date().toISOString(),
      });

      if (error) {
        await logger.error(
          'Security log error',
          { component: 'security', operation: 'logSecurityEvent' },
          error as Error
        );
      }
    } catch (error) {
      await logger.error(
        'Security logging failed',
        { component: 'security', operation: 'logSecurityEvent' },
        error as Error
      );
    }
  },

  // Validate session and check for anomalies
  validateSession: async (session: any) => {
    if (!session) return false;

    const now = Date.now();
    const sessionCreated = new Date(session.created_at).getTime();
    const sessionAge = now - sessionCreated;

    // Check if session is too old (24 hours)
    if (sessionAge > 24 * 60 * 60 * 1000) {
      await SECURITY_FUNCTIONS.logSecurityEvent({
        userId: session.user?.id,
        eventType: 'session_expired',
        severity: 'medium',
        details: { sessionAge, maxAge: 24 * 60 * 60 * 1000 },
      });
      return false;
    }

    return true;
  },
};

// Input validation helpers
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  name: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.email.test(email);
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.password;

  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Environment validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const productionRequired = ['NEXT_PUBLIC_APP_URL'];

    productionRequired.forEach(key => {
      if (!process.env[key]) {
        errors.push(`Missing required production environment variable: ${key}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
