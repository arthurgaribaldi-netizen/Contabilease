/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  message: string;
}

// Authentication logic helper
function performAuth(mode: 'login' | 'register', state: AuthFormState) {
  const { email, password, confirmPassword } = state;

  if (mode === 'register' && password !== confirmPassword) {
    return Promise.reject(new Error('As senhas não coincidem'));
  }

  const authMethod =
    mode === 'register'
      ? () => supabase.auth.signUp({ email, password })
      : () => supabase.auth.signInWithPassword({ email, password });

  return authMethod();
}

// Custom hook for authentication logic
function useAuthForm(mode: 'login' | 'register') {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    message: '',
  });

  const updateState = (updates: Partial<AuthFormState>) =>
    setState(prev => ({ ...prev, ...updates }));

  const validateForm = () => {
    const { email, password, confirmPassword } = state;

    // Validação de email obrigatório
    if (!email || !email.trim()) {
      throw new Error('Email é obrigatório');
    }

    // Validação de senha obrigatória
    if (!password || !password.trim()) {
      throw new Error('Senha é obrigatória');
    }

    // Validação de formato de email
    if (!email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Validação de comprimento da senha
    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Validação de confirmação de senha (apenas no modo registro)
    if (mode === 'register' && password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ loading: true, message: '' });

    try {
      validateForm();
    } catch (error) {
      // Validation error handled by error state
      updateState({
        message: error instanceof Error ? error.message : 'Erro de validação',
        loading: false,
      });
      return;
    }

    performAuth(mode, state)
      .then(({ error }) => {
        if (error) throw error;

        const successMessage = mode === 'register' ? t('registerSuccess') : t('loginSuccess');
        updateState({
          message: successMessage,
          email: '',
          password: '',
          confirmPassword: '',
        });

        const locale = pathname?.split('/')?.[1] ?? 'pt-BR';
        router.push(`/${locale}/dashboard`);
      })
      .catch((error: unknown) => {
        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        }
        updateState({ message: errorMessage });
      })
      .finally(() => updateState({ loading: false }));
  };

  return { state, updateState, handleSubmit, t, tCommon };
}

// Reusable input component with specific classes
function AuthInput({
  id,
  type,
  value,
  onChange,
  label,
  required = false,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <div className='contabilease-auth contabilease-form'>
      <label
        htmlFor={id}
        className='contabilease-auth contabilease-form contabilease-text-gray-700 block text-sm font-medium'
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className='contabilease-auth contabilease-form contabilease-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
      />
    </div>
  );
}

// Message display component with specific classes
function MessageDisplay({ message }: { message: string }) {
  if (!message) return null;

  const isSuccess = message.includes('sucesso') || message.includes('success');
  return (
    <div
      className={`contabilease-auth contabilease-form mt-4 p-3 rounded-md ${
        isSuccess
          ? 'contabilease-bg-green-100 contabilease-text-green-700 bg-green-100 text-green-700'
          : 'contabilease-bg-red-100 contabilease-text-red-700 bg-red-100 text-red-700'
      }`}
    >
      {message}
    </div>
  );
}

// Basic form fields (email and password)
function BasicFormFields({
  state,
  updateState,
  t,
}: {
  state: AuthFormState;
  updateState: (updates: Partial<AuthFormState>) => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <AuthInput
        id='email'
        type='email'
        value={state.email}
        onChange={e => updateState({ email: e.target.value })}
        label={t('email')}
        required
      />
      <AuthInput
        id='password'
        type='password'
        value={state.password}
        onChange={e => updateState({ password: e.target.value })}
        label={t('password')}
        required
      />
    </>
  );
}

// Confirm password field for registration
function ConfirmPasswordField({
  state,
  updateState,
  t,
}: {
  state: AuthFormState;
  updateState: (updates: Partial<AuthFormState>) => void;
  t: (key: string) => string;
}) {
  return (
    <AuthInput
      id='confirmPassword'
      type='password'
      value={state.confirmPassword}
      onChange={e => updateState({ confirmPassword: e.target.value })}
      label={t('confirmPassword')}
      required
    />
  );
}

// Form fields component
function AuthFormFields({
  mode,
  state,
  updateState,
  t,
}: {
  mode: 'login' | 'register';
  state: AuthFormState;
  updateState: (updates: Partial<AuthFormState>) => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <BasicFormFields state={state} updateState={updateState} t={t} />
      {mode === 'register' && (
        <ConfirmPasswordField state={state} updateState={updateState} t={t} />
      )}
    </>
  );
}

// Submit button component
function AuthSubmitButton({
  mode,
  loading,
  t,
  tCommon,
}: {
  mode: 'login' | 'register';
  loading: boolean;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}) {
  return (
    <button
      type='submit'
      disabled={loading}
      className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50'
    >
      {loading ? tCommon('loading') : mode === 'login' ? t('login') : t('register')}
    </button>
  );
}

// Main AuthForm component (now under 40 lines)
export default function AuthForm({ mode }: AuthFormProps) {
  const { state, updateState, handleSubmit, t, tCommon } = useAuthForm(mode);

  return (
    <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold text-center mb-6'>
        {mode === 'login' ? t('login') : t('register')}
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4' noValidate>
        <AuthFormFields mode={mode} state={state} updateState={updateState} t={t} />
        <AuthSubmitButton mode={mode} loading={state.loading} t={t} tCommon={tCommon} />
      </form>

      <MessageDisplay message={state.message} />

      <div className='mt-4 text-center'>
        <button
          type='button'
          onClick={() => {
            // Password reset functionality will be implemented in future release
            // TODO: Implement password reset functionality
          }}
          className='text-sm text-primary-600 hover:text-primary-500 bg-transparent border-none cursor-pointer'
        >
          {t('forgotPassword')}
        </button>
      </div>
    </div>
  );
}
