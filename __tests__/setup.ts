import '@testing-library/jest-dom';
import React from 'react';

// Polyfills for Node.js environment
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock crypto for speakeasy
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr.map(() => Math.floor(Math.random() * 256)),
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js internationalization
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'pt-BR',
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock framer-motion to disable animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, initial, transition, whileHover, ...restProps } = props;
      return React.createElement('div', restProps, children);
    },
    li: ({ children, ...props }: any) => {
      const { animate, initial, transition, whileHover, ...restProps } = props;
      return React.createElement('li', restProps, children);
    },
    button: ({ children, ...props }: any) => {
      const { animate, initial, transition, whileHover, ...restProps } = props;
      return React.createElement('button', restProps, children);
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));
