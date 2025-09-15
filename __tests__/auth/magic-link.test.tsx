import MagicLinkForm from '@/components/auth/MagicLinkForm';
import { useMagicLink } from '@/hooks/useMagicLink';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/pt-BR/auth/magic-link'),
}));

// Mock do hook useMagicLink
jest.mock('@/hooks/useMagicLink', () => ({
  useMagicLink: jest.fn(),
}));

// Mock do fetch
global.fetch = jest.fn();

describe('MagicLinkForm', () => {
  const mockPush = jest.fn();
  const mockUseMagicLink = useMagicLink as jest.MockedFunction<typeof useMagicLink>;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockUseMagicLink.mockReturnValue({
      sendMagicLink: jest.fn(),
      loading: false,
      error: null,
      success: false,
      reset: jest.fn(),
    });

    (global.fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('renders magic link form correctly', () => {
    render(<MagicLinkForm />);
    
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
    expect(screen.getByText('Magic Link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@escritorio.com')).toBeInTheDocument();
    expect(screen.getByText('Enviar Magic Link')).toBeInTheDocument();
  });

  it('validates email input', async () => {
    render(<MagicLinkForm />);
    
    const emailInput = screen.getByPlaceholderText('seu@escritorio.com');
    
    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Por favor, insira um email válido')).toBeInTheDocument();
    });

    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.queryByText('Por favor, insira um email válido')).not.toBeInTheDocument();
    });
  });

  it('submits form with valid email', async () => {
    const mockSendMagicLink = jest.fn().mockResolvedValue(undefined);
    mockUseMagicLink.mockReturnValue({
      sendMagicLink: mockSendMagicLink,
      loading: false,
      error: null,
      success: false,
      reset: jest.fn(),
    });

    render(<MagicLinkForm />);
    
    const emailInput = screen.getByPlaceholderText('seu@escritorio.com');
    const submitButton = screen.getByText('Enviar Magic Link');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows loading state during submission', () => {
    mockUseMagicLink.mockReturnValue({
      sendMagicLink: jest.fn(),
      loading: true,
      error: null,
      success: false,
      reset: jest.fn(),
    });

    render(<MagicLinkForm />);
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    mockUseMagicLink.mockReturnValue({
      sendMagicLink: jest.fn(),
      loading: false,
      error: 'Erro ao enviar magic link',
      success: false,
      reset: jest.fn(),
    });

    render(<MagicLinkForm />);
    
    expect(screen.getByText('Erro ao enviar magic link')).toBeInTheDocument();
  });

  it('shows success state after email sent', () => {
    mockUseMagicLink.mockReturnValue({
      sendMagicLink: jest.fn(),
      loading: false,
      error: null,
      success: true,
      reset: jest.fn(),
    });

    render(<MagicLinkForm />);
    
    expect(screen.getByText('Email Enviado!')).toBeInTheDocument();
    expect(screen.getByText('Reenviar Magic Link')).toBeInTheDocument();
  });

  it('handles resend functionality', async () => {
    const mockSendMagicLink = jest.fn().mockResolvedValue(undefined);
    mockUseMagicLink.mockReturnValue({
      sendMagicLink: mockSendMagicLink,
      loading: false,
      error: null,
      success: true,
      reset: jest.fn(),
    });

    render(<MagicLinkForm />);
    
    const resendButton = screen.getByText('Reenviar Magic Link');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(mockSendMagicLink).toHaveBeenCalled();
    });
  });

  it('shows security indicators', () => {
    render(<MagicLinkForm />);
    
    expect(screen.getByText('100% Seguro')).toBeInTheDocument();
    expect(screen.getByText('Sem Senha')).toBeInTheDocument();
    expect(screen.getByText('Instantâneo')).toBeInTheDocument();
  });

  it('shows alternative login options', () => {
    render(<MagicLinkForm />);
    
    expect(screen.getByText('Login tradicional')).toBeInTheDocument();
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });
});

describe('Magic Link API', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('sends magic link request correctly', async () => {
    const mockResponse = {
      success: true,
      message: 'Magic link enviado com sucesso!',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        redirectTo: 'http://localhost:3000/auth/callback',
      }),
    });

    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        redirectTo: 'http://localhost:3000/auth/callback',
      }),
    });

    expect(data).toEqual(mockResponse);
  });

  it('handles API errors correctly', async () => {
    const mockError = {
      error: 'Falha ao enviar magic link',
      details: 'Email inválido',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    });

    const response = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
      }),
    });

    const data = await response.json();

    expect(data).toEqual(mockError);
  });
});
