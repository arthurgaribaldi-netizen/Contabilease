/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { logger } from '@/lib/logger';
import {
  ReportConfiguration,
  ReportData,
  IFRS16ReportGenerator as ReportGenerator,
} from '@/lib/reports/ifrs16-report-generator';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { useState } from 'react';

interface IFRS16ReportGeneratorProps {
  contractData: IFRS16CompleteData;
  currencyCode?: string;
}

export default function IFRS16ReportGenerator({
  contractData,
  currencyCode = 'BRL',
}: IFRS16ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<
    'comprehensive' | 'compliance' | 'audit' | 'executive_summary'
  >('comprehensive');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
  const [includeSections, setIncludeSections] = useState({
    contract_details: true,
    calculations: true,
    advanced_disclosures: true,
    exceptions: true,
    impairment: true,
    sensitivity: true,
    modifications: true,
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const config: ReportConfiguration = {
        report_type: reportType,
        include_sections: includeSections,
        format,
        language: 'pt-BR',
        company_info: {
          name: 'Contabilease',
          address: 'Endereço da empresa',
          contact_info: 'contato@contabilease.com',
        },
      };

      const generator = new ReportGenerator(contractData, config);
      const reportData = await generator.generateReportData();

      if (format === 'pdf' || format === 'both') {
        await generatePDFReport(generator, reportData);
      }

      if (format === 'excel' || format === 'both') {
        await generateExcelReport(generator, reportData);
      }
    } catch (error) {
      logger.error(
        'Error generating report:',
        {
          component: 'ifrs16reportgenerator',
          operation: 'generateReport',
        },
        error as Error
      );
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async (generator: ReportGenerator, reportData: ReportData) => {
    try {
      const sections = await generator.generatePDFReport(reportData);

      // Create PDF content
      const pdfContent = createPDFContent(sections, reportData);

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IFRS16_Report_${contractData.contract_id}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error(
        'Error generating PDF:',
        {
          component: 'ifrs16reportgenerator',
          operation: 'generatePDF',
        },
        error as Error
      );
      throw error;
    }
  };

  const generateExcelReport = async (generator: ReportGenerator, reportData: ReportData) => {
    try {
      const worksheets = await generator.generateExcelReport(reportData);

      // Create Excel content
      const excelContent = createExcelContent(worksheets);

      // Create and download Excel
      const blob = new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IFRS16_Report_${contractData.contract_id}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error(
        'Error generating Excel:',
        {
          component: 'ifrs16reportgenerator',
          operation: 'generateExcel',
        },
        error as Error
      );
      throw error;
    }
  };

  const createPDFContent = (sections: any[], reportData: ReportData): string => {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório IFRS 16 - ${contractData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          h3 { color: #4b5563; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .summary { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Relatório IFRS 16 - ${contractData.title}</h1>
        <div class="summary">
          <p><strong>Contrato:</strong> ${contractData.title}</p>
          <p><strong>Status de Conformidade:</strong> ${reportData.report_metadata.compliance_status}</p>
          <p><strong>Data de Geração:</strong> ${new Date(reportData.report_metadata.generated_date).toLocaleDateString('pt-BR')}</p>
          <p><strong>Gerado por:</strong> ${reportData.report_metadata.generated_by}</p>
        </div>
        
        ${sections
          .map(
            section => `
          <h2>${section.title}</h2>
          <div>${section.content}</div>
        `
          )
          .join('')}
        
        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo sistema Contabilease.</p>
          <p>Para dúvidas ou suporte, entre em contato: contato@contabilease.com</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const createExcelContent = (worksheets: any[]): string => {
    // Create CSV content (simplified Excel export)
    let csvContent = '';

    worksheets.forEach(worksheet => {
      csvContent += `\n=== ${worksheet.name} ===\n`;
      worksheet.data.forEach((row: any[]) => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      csvContent += '\n';
    });

    return csvContent;
  };

  return (
    <div className='bg-white rounded-lg shadow'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Gerador de Relatórios IFRS 16</h3>
        <p className='text-sm text-gray-600 mt-1'>
          Gere relatórios completos em PDF e Excel para auditoria e conformidade
        </p>
      </div>

      {/* Configuration */}
      <div className='p-6 space-y-6'>
        {/* Report Type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3'>Tipo de Relatório</label>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {[
              { value: 'comprehensive', label: 'Completo', description: 'Todas as análises' },
              { value: 'compliance', label: 'Conformidade', description: 'Foco em compliance' },
              { value: 'audit', label: 'Auditoria', description: 'Para auditores' },
              { value: 'executive_summary', label: 'Resumo Executivo', description: 'Visão geral' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setReportType(type.value as any)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  reportType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='font-medium text-sm'>{type.label}</div>
                <div className='text-xs text-gray-500 mt-1'>{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3'>Formato de Saída</label>
          <div className='flex space-x-4'>
            {[
              { value: 'pdf', label: 'PDF', icon: '📄' },
              { value: 'excel', label: 'Excel', icon: '📊' },
              { value: 'both', label: 'Ambos', icon: '📁' },
            ].map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setFormat(fmt.value as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  format === fmt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{fmt.icon}</span>
                <span className='font-medium'>{fmt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections Selection */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3'>Seções a Incluir</label>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {[
              { key: 'contract_details', label: 'Detalhes do Contrato' },
              { key: 'calculations', label: 'Cálculos IFRS 16' },
              { key: 'advanced_disclosures', label: 'Divulgações Avançadas' },
              { key: 'exceptions', label: 'Exceções' },
              { key: 'impairment', label: 'Teste de Impairment' },
              { key: 'sensitivity', label: 'Análise de Sensibilidade' },
              { key: 'modifications', label: 'Modificações' },
            ].map(section => (
              <label key={section.key} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={includeSections[section.key as keyof typeof includeSections]}
                  onChange={e =>
                    setIncludeSections(prev => ({
                      ...prev,
                      [section.key]: e.target.checked,
                    }))
                  }
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>{section.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-2'>Preview do Relatório</h4>
          <div className='text-sm text-gray-600 space-y-1'>
            <p>
              <strong>Tipo:</strong> {reportType.replace('_', ' ').toUpperCase()}
            </p>
            <p>
              <strong>Formato:</strong> {format.toUpperCase()}
            </p>
            <p>
              <strong>Seções:</strong> {Object.values(includeSections).filter(Boolean).length} de{' '}
              {Object.keys(includeSections).length}
            </p>
            <p>
              <strong>Contrato:</strong> {contractData.title}
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className='flex justify-end'>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className='flex items-center space-x-2'>
                <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <span>Gerando...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <span>Gerar Relatório</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Information */}
      <div className='bg-blue-50 border-t border-blue-200 px-6 py-4'>
        <div className='flex items-start space-x-3'>
          <svg
            className='w-5 h-5 text-blue-600 mt-0.5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <div className='text-sm text-blue-800'>
            <p className='font-medium'>Informações sobre os Relatórios</p>
            <ul className='mt-1 space-y-1 text-blue-700'>
              <li>• Relatórios PDF incluem análise completa e formatação profissional</li>
              <li>• Relatórios Excel contêm dados estruturados para análise adicional</li>
              <li>• Todos os relatórios são auditáveis e conformes com IFRS 16</li>
              <li>• Os arquivos são baixados automaticamente após a geração</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
