/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import AuthForm from '@/components/auth/AuthForm';
import { supabase } from '@/lib/supabase';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn() as jest.MockedFunction<any>,
      signInWithPassword: jest.fn() as jest.MockedFunction<any>,
    },
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/pt-BR/auth/login',
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      auth: {
        email: 'Email',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        login: 'Entrar',
        register: 'Registrar',
        forgotPassword: 'Esqueci minha senha',
        loginSuccess: 'Login realizado com sucesso',
        registerSuccess: 'Cadastro realizado com sucesso',
      },
      common: {
        loading: 'Carregando...',
        cancel: 'Cancelar',
      },
    };
    return translations[namespace]?.[key] || key;
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('should render login form correctly', () => {
      render(<AuthForm mode='login' />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/confirmar senha/i)).not.toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: null },
        error: null,
      });

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');

      await user.click(screen.getByRole('button', { name: /entrar/i }));

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'wrongpassword');

      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signInWithPassword.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  data: { user: null, session: null },
                  error: null,
                }),
              100
            )
          )
      );

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');

      await user.click(screen.getByRole('button', { name: /entrar/i }));

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });

  describe('Register Mode', () => {
    it('should render register form correctly', () => {
      render(<AuthForm mode='register' />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
    });

    it('should handle password mismatch', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='register' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'differentpassword');

      await user.click(screen.getByRole('button', { name: /registrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
      });

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: null },
        error: null,
      });

      render(<AuthForm mode='register' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');

      await user.click(screen.getByRole('button', { name: /registrar/i }));

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle registration error', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      render(<AuthForm mode='register' />);

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');

      await user.click(screen.getByRole('button', { name: /registrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require email field', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='login' />);

      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should require password field', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), '123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: null },
        error: null,
      });

      render(<AuthForm mode='login' />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
      await waitFor(() => {
        expect(passwordInput).toHaveValue('');
      });
    });

    it('should clear error messages on new submission', async () => {
      const user = userEvent.setup();

      // First submission with error
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Second submission with success
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: null },
        error: null,
      });

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'correctpassword');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });
});
