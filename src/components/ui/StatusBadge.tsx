'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface StatusBadgeProps {
  status:
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'pending'
    | 'active'
    | 'draft'
    | 'completed'
    | 'cancelled';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'active':
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircleIcon,
          iconColor: 'text-green-500',
          defaultLabel:
            status === 'success' ? 'Sucesso' : status === 'active' ? 'Ativo' : 'Concluído',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          defaultLabel: 'Atenção',
        };
      case 'error':
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircleIcon,
          iconColor: 'text-red-500',
          defaultLabel: status === 'error' ? 'Erro' : 'Cancelado',
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-500',
          defaultLabel: 'Informação',
        };
      case 'pending':
      case 'draft':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: ClockIcon,
          iconColor: 'text-gray-500',
          defaultLabel: status === 'pending' ? 'Pendente' : 'Rascunho',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: InformationCircleIcon,
          iconColor: 'text-gray-500',
          defaultLabel: 'Desconhecido',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          icon: 'h-3 w-3',
        };
      case 'md':
        return {
          container: 'px-2.5 py-0.5',
          text: 'text-sm',
          icon: 'h-4 w-4',
        };
      case 'lg':
        return {
          container: 'px-3 py-1',
          text: 'text-base',
          icon: 'h-5 w-5',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses.container} ${sizeClasses.text} ${className}`}
    >
      {showIcon && <Icon className={`${sizeClasses.icon} ${config.iconColor} mr-1.5`} />}
      {displayLabel}
    </span>
  );
}

// Componente para exibir múltiplos status em uma lista
interface StatusListProps {
  statuses: Array<{
    status: StatusBadgeProps['status'];
    label?: string;
    count?: number;
  }>;
  className?: string;
}

export function StatusList({ statuses, className = '' }: StatusListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map((item, index) => (
        <div key={index} className='flex items-center'>
          <StatusBadge status={item.status} label={item.label} size='sm' />
          {item.count !== undefined && (
            <span className='ml-2 text-sm text-gray-500'>({item.count})</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Componente para progresso de status
interface StatusProgressProps {
  current: number;
  total: number;
  statuses: Array<{
    status: StatusBadgeProps['status'];
    label: string;
  }>;
  className?: string;
}

export function StatusProgress({ current, total, statuses, className = '' }: StatusProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className='flex justify-between text-sm text-gray-600'>
        <span>Progresso</span>
        <span>
          {current} de {total}
        </span>
      </div>

      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out'
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='flex justify-between'>
        {statuses.map((status, index) => (
          <div key={index} className='text-center'>
            <StatusBadge status={status.status} label={status.label} size='sm' />
          </div>
        ))}
      </div>
    </div>
  );
}
