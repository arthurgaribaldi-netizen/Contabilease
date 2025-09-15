import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

// Main Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'contabilease-web'
    }
  }
});

// Server-side Supabase client for API routes and server components
export const createServerClient = () => {
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
};

// Database types
export interface Country {
  id: string;
  iso_code: string;
  name: string;
  currency_code: string;
  date_format: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  country_id?: string;
  locale?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id?: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
