import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    render(<GoogleLoginButton />);

    expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders register button correctly', () => {
    render(<GoogleLoginButton />);

    expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
  });

  it('calls Supabase signInWithOAuth when clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });
  });

  it('shows loading state when clicked', async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Conectando...')).toBeInTheDocument();
    });
  });

  it('handles OAuth error gracefully', async () => {
    const mockOnError = jest.fn();
    mockSignInWithOAuth.mockRejectedValue(new Error('OAuth failed'));

    render(<GoogleLoginButton onError={mockOnError} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('OAuth failed');
    });
  });

  it('is disabled when loading', async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
