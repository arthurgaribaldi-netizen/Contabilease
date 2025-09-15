'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ComplianceData {
  compliant: number;
  warnings: number;
  errors: number;
  total: number;
}

interface ComplianceChartProps {
  data: ComplianceData;
  className?: string;
}

export default function ComplianceChart({ data, className = '' }: ComplianceChartProps) {
  const { compliant, warnings, errors, total } = data;

  const getCompliancePercentage = () => {
    return total > 0 ? Math.round((compliant / total) * 100) : 0;
  };

  const getComplianceColor = () => {
    const percentage = getCompliancePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = () => {
    const percentage = getCompliancePercentage();
    if (percentage >= 90) return <CheckCircleIcon className='h-8 w-8 text-green-500' />;
    if (percentage >= 70) return <ExclamationTriangleIcon className='h-8 w-8 text-yellow-500' />;
    return <XCircleIcon className='h-8 w-8 text-red-500' />;
  };

  const getComplianceStatus = () => {
    const percentage = getCompliancePercentage();
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 70) return 'Bom';
    return 'Necessita Atenção';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>Conformidade IFRS 16</h3>
          <p className='text-sm text-gray-500'>Status geral dos contratos</p>
        </div>
        {getComplianceIcon()}
      </div>

      {/* Main Compliance Score */}
      <div className='text-center mb-6'>
        <div className={`text-4xl font-bold ${getComplianceColor()}`}>
          {getCompliancePercentage()}%
        </div>
        <div className='text-sm text-gray-500 mt-1'>{getComplianceStatus()}</div>
      </div>

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex justify-between text-sm text-gray-600 mb-2'>
          <span>Conformidade</span>
          <span>
            {compliant} de {total} contratos
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              getCompliancePercentage() >= 90
                ? 'bg-green-500'
                : getCompliancePercentage() >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${getCompliancePercentage()}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
            <span className='text-sm text-gray-700'>Conformes</span>
          </div>
          <span className='text-sm font-medium text-gray-900'>{compliant}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <ExclamationTriangleIcon className='h-5 w-5 text-yellow-500 mr-2' />
            <span className='text-sm text-gray-700'>Avisos</span>
          </div>
          <span className='text-sm font-medium text-gray-900'>{warnings}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <XCircleIcon className='h-5 w-5 text-red-500 mr-2' />
            <span className='text-sm text-gray-700'>Erros</span>
          </div>
          <span className='text-sm font-medium text-gray-900'>{errors}</span>
        </div>
      </div>

      {/* Recommendations */}
      {getCompliancePercentage() < 90 && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>Recomendações</h4>
          <ul className='text-sm text-gray-600 space-y-1'>
            {errors > 0 && (
              <li>
                • Corrija {errors} erro{errors > 1 ? 's' : ''} crítico{errors > 1 ? 's' : ''}{' '}
                identificado{errors > 1 ? 's' : ''}
              </li>
            )}
            {warnings > 0 && (
              <li>
                • Revise {warnings} aviso{warnings > 1 ? 's' : ''} de conformidade
              </li>
            )}
            <li>• Execute cálculos IFRS 16 para todos os contratos</li>
            <li>• Atualize dados financeiros regularmente</li>
          </ul>
        </div>
      )}
    </div>
  );
}
