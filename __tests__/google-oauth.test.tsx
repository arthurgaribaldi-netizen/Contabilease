import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '../src/components/auth/GoogleLoginButton';
import { supabase } from '../src/lib/supabase';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/pt-BR/auth/login'),
}));

// Mock Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.loginWithGoogle': 'Entrar com Google',
      'auth.registerWithGoogle': 'Cadastrar com Google',
      'common.loading': 'Carregando...',
    };
    return translations[key] || key;
  },
}));

describe('GoogleLoginButton', () => {
  const mockPush = jest.fn();
  const mockSignInWithOAuth = supabase.auth.signInWithOAuth as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders login button correctly', () => {
    render(<GoogleLoginButton mode="login" />);
    
    expect(screen.getByText('Entrar com Google')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders register button correctly', () => {
    render(<GoogleLoginButton mode="register" />);
    
    expect(screen.getByText('Cadastrar com Google')).toBeInTheDocument();
  });

  it('calls Supabase signInWithOAuth when clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    
    render(<GoogleLoginButton mode="login" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });
  });

  it('shows loading state when clicked', async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<GoogleLoginButton mode="login" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  it('handles OAuth error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSignInWithOAuth.mockRejectedValue(new Error('OAuth failed'));
    
    render(<GoogleLoginButton mode="login" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Google login failed:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('is disabled when loading', async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<GoogleLoginButton mode="login" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
