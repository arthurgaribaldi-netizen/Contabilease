import ContractModificationExample from '@/components/contracts/ContractModificationExample';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo Modificações de Contratos - Contabilease | IFRS 16',
  description: 'Veja como o Contabilease lida com modificações de contratos de leasing conforme IFRS 16. Demonstração prática e interativa.',
  keywords: 'modificações contratos IFRS 16, demo modificações leasing, alterações contratos contábeis, software modificações IFRS',
  openGraph: {
    title: 'Demo Modificações de Contratos - Contabilease',
    description: 'Teste como o Contabilease gerencia modificações de contratos de leasing automaticamente.',
    url: 'https://contabilease.com/pt-BR/contract-modifications-demo',
    type: 'website',
  },
  alternates: {
    canonical: 'https://contabilease.com/pt-BR/contract-modifications-demo',
    languages: {
      'pt-BR': 'https://contabilease.com/pt-BR/contract-modifications-demo',
      'en': 'https://contabilease.com/en/contract-modifications-demo',
      'es': 'https://contabilease.com/es/contract-modifications-demo',
    },
  },
  robots: {
    index: true, // Demo pages should be indexed for discovery
    follow: true,
  },
};

export default function ContractModificationsDemoPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <ContractModificationExample />
    </div>
  );
}
