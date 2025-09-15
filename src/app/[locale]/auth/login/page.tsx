import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Contabilease | Acesse sua Conta',
  description: 'Faça login no Contabilease e acesse seus cálculos de IFRS 16. Interface segura e intuitiva para contadores.',
  keywords: 'login contabilease, acesso conta, IFRS 16 login, software contábil login',
  openGraph: {
    title: 'Login - Contabilease',
    description: 'Acesse sua conta e continue seus cálculos de IFRS 16',
    url: 'https://contabilease.com/pt-BR/auth/login',
  },
  alternates: {
    canonical: 'https://contabilease.com/pt-BR/auth/login',
    languages: {
      'pt-BR': 'https://contabilease.com/pt-BR/auth/login',
      'en': 'https://contabilease.com/en/auth/login',
      'es': 'https://contabilease.com/es/auth/login',
    },
  },
  robots: {
    index: false, // Login pages typically shouldn't be indexed
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <AuthForm mode='login' />
    </div>
  );
}
