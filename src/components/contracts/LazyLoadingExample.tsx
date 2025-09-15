/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useState } from 'react';
import AmortizationScheduleTable from './AmortizationScheduleTable';
import OptimizedAmortizationTable from './OptimizedAmortizationTable';
import VirtualAmortizationTable from './VirtualAmortizationTable';

interface LazyLoadingExampleProps {
  contractId: string;
  currencyCode?: string;
}

export default function LazyLoadingExample({
  contractId,
  currencyCode = 'BRL',
}: LazyLoadingExampleProps) {
  const [selectedView, setSelectedView] = useState<'traditional' | 'virtual' | 'optimized'>('traditional');

  return (
    <div className='space-y-6'>
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Exemplos de Lazy Loading para Tabelas de Amortização
        </h2>
        
        <div className='mb-6'>
          <p className='text-gray-600 mb-4'>
            Este exemplo demonstra três abordagens diferentes para implementar lazy loading em tabelas de amortização:
          </p>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='border rounded-lg p-4'>
              <h3 className='font-medium text-gray-900 mb-2'>1. Tradicional com Lazy Loading</h3>
              <p className='text-sm text-gray-600 mb-3'>
                Versão atualizada do componente original com suporte a carregamento sob demanda via API.
              </p>
              <button
                onClick={() => setSelectedView('traditional')}
                className={`w-full px-3 py-2 text-sm rounded-md ${
                  selectedView === 'traditional'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usar Tradicional
              </button>
            </div>

            <div className='border rounded-lg p-4'>
              <h3 className='font-medium text-gray-900 mb-2'>2. Virtual Scrolling</h3>
              <p className='text-sm text-gray-600 mb-3'>
                Renderização virtual para grandes volumes de dados com scroll suave e performance otimizada.
              </p>
              <button
                onClick={() => setSelectedView('virtual')}
                className={`w-full px-3 py-2 text-sm rounded-md ${
                  selectedView === 'virtual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usar Virtual
              </button>
            </div>

            <div className='border rounded-lg p-4'>
              <h3 className='font-medium text-gray-900 mb-2'>3. Otimizado com Cache</h3>
              <p className='text-sm text-gray-600 mb-3'>
                Versão otimizada com cache inteligente, memoização e carregamento assíncrono.
              </p>
              <button
                onClick={() => setSelectedView('optimized')}
                className={`w-full px-3 py-2 text-sm rounded-md ${
                  selectedView === 'optimized'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usar Otimizado
              </button>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <h4 className='font-medium text-gray-900 mb-2'>Características de cada abordagem:</h4>
          <ul className='text-sm text-gray-600 space-y-1'>
            <li><strong>Tradicional:</strong> Paginação simples, carregamento sob demanda, compatível com código existente</li>
            <li><strong>Virtual:</strong> Scroll infinito, renderização eficiente, ideal para grandes datasets</li>
            <li><strong>Otimizado:</strong> Cache inteligente, memoização, loading states avançados, melhor UX</li>
          </ul>
        </div>
      </div>

      {/* Render selected component */}
      <div className='bg-white shadow rounded-lg'>
        {selectedView === 'traditional' && (
          <AmortizationScheduleTable
            contractId={contractId}
            currencyCode={currencyCode}
            enableLazyLoading={true}
            itemsPerPage={12}
          />
        )}

        {selectedView === 'virtual' && (
          <VirtualAmortizationTable
            contractId={contractId}
            currencyCode={currencyCode}
            height={600}
            itemHeight={50}
          />
        )}

        {selectedView === 'optimized' && (
          <OptimizedAmortizationTable
            contractId={contractId}
            currencyCode={currencyCode}
            itemsPerPage={12}
            enableCache={true}
          />
        )}
      </div>

      {/* Performance tips */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-medium text-blue-900 mb-2'>💡 Dicas de Performance:</h4>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>• Use cache para reduzir chamadas à API</li>
          <li>• Implemente debounce para pesquisas</li>
          <li>• Considere virtual scrolling para datasets {'>'} 1000 itens</li>
          <li>• Use memoização para componentes pesados</li>
          <li>• Implemente loading states para melhor UX</li>
        </ul>
      </div>
    </div>
  );
}
