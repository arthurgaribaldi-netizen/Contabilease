import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro - Contabilease | Comece Grátis por 30 Dias',
  description: 'Cadastre-se no Contabilease e teste grátis por 30 dias. Software IFRS 16 para contadores. Sem compromisso.',
  keywords: 'cadastro contabilease, teste grátis IFRS 16, software contábil cadastro, plano gratuito',
  openGraph: {
    title: 'Cadastre-se - Contabilease',
    description: 'Teste grátis por 30 dias. Software IFRS 16 para contadores.',
    url: 'https://contabilease.com/pt-BR/auth/signup',
  },
  alternates: {
    canonical: 'https://contabilease.com/pt-BR/auth/signup',
    languages: {
      'pt-BR': 'https://contabilease.com/pt-BR/auth/signup',
      'en': 'https://contabilease.com/en/auth/signup',
      'es': 'https://contabilease.com/es/auth/signup',
    },
  },
  robots: {
    index: true, // Signup pages can be indexed for acquisition
    follow: true,
  },
};

export default function SignupPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <AuthForm mode='register' />
    </div>
  );
}
