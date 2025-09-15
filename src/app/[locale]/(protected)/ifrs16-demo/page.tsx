import IFRS16Example from '@/components/contracts/IFRS16Example';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo IFRS 16 - Contabilease | Teste os Cálculos Online',
  description: 'Teste o Contabilease gratuitamente. Veja como funciona o cálculo automático de IFRS 16. Demonstração interativa sem cadastro.',
  keywords: 'demo IFRS 16, teste contabilease, cálculo leasing online, demonstração IFRS 16, software contábil demo',
  openGraph: {
    title: 'Demo IFRS 16 - Contabilease',
    description: 'Teste gratuitamente o software de cálculos IFRS 16. Veja como economizar tempo nos seus contratos de leasing.',
    url: 'https://contabilease.com/pt-BR/ifrs16-demo',
    type: 'website',
  },
  alternates: {
    canonical: 'https://contabilease.com/pt-BR/ifrs16-demo',
    languages: {
      'pt-BR': 'https://contabilease.com/pt-BR/ifrs16-demo',
      'en': 'https://contabilease.com/en/ifrs16-demo',
      'es': 'https://contabilease.com/es/ifrs16-demo',
    },
  },
  robots: {
    index: true, // Demo pages should be indexed for discovery
    follow: true,
  },
};

export default function IFRS16DemoPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <IFRS16Example />
    </div>
  );
}
