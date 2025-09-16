'use client';

import { UI_CONSTANTS } from '@/lib/constants/validation-limits';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export interface EnhancedToastProps {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const toastColors = {
  success:
    'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
};

const iconColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export default function EnhancedToast({
  id,
  title,
  description,
  type,
  duration = UI_CONSTANTS.TOAST_DURATION,
  action,
  onClose,
  position = 'top-right',
}: EnhancedToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState<number>(UI_CONSTANTS.PROGRESS_BAR_MAX);

  const Icon = toastIcons[type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress =
          prev - UI_CONSTANTS.PROGRESS_BAR_MAX / (duration / UI_CONSTANTS.ANIMATION_DURATION_SHORT);
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, UI_CONSTANTS.ANIMATION_DURATION_SHORT);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (action) {
      action.onClick();
      handleClose();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={cn(
        `fixed z-${UI_CONSTANTS.Z_INDEX_TOAST} max-w-sm w-full shadow-lg rounded-lg border p-4 transition-all duration-${UI_CONSTANTS.ANIMATION_DURATION_MEDIUM} ease-in-out`,
        toastColors[type],
        getPositionClasses(),
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95',
        isLeaving && 'translate-x-full opacity-0 scale-95'
      )}
      role='alert'
      aria-live='polite'
    >
      {/* Progress Bar */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden'>
        <div
          className={cn(
            `h-full transition-all duration-${UI_CONSTANTS.ANIMATION_DURATION_SHORT} ease-linear`,
            type === 'success' && 'bg-green-500',
            type === 'error' && 'bg-red-500',
            type === 'warning' && 'bg-yellow-500',
            type === 'info' && 'bg-blue-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='flex items-start'>
        <div className='flex-shrink-0'>
          <Icon className={cn('h-5 w-5', iconColors[type])} aria-hidden='true' />
        </div>
        <div className='ml-3 w-0 flex-1'>
          <p className='text-sm font-medium'>{title}</p>
          {description && <p className='mt-1 text-sm opacity-90'>{description}</p>}
          {action && (
            <div className='mt-3'>
              <button
                onClick={handleAction}
                className={cn(
                  'text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
                  iconColors[type],
                  type === 'success' && 'focus:ring-green-500',
                  type === 'error' && 'focus:ring-red-500',
                  type === 'warning' && 'focus:ring-yellow-500',
                  type === 'info' && 'focus:ring-blue-500'
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        <div className='ml-4 flex-shrink-0 flex'>
          <button
            onClick={handleClose}
            className={cn(
              'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              iconColors[type],
              type === 'success' && 'focus:ring-green-500',
              type === 'error' && 'focus:ring-red-500',
              type === 'warning' && 'focus:ring-yellow-500',
              type === 'info' && 'focus:ring-blue-500'
            )}
            aria-label='Fechar notificação'
          >
            <XMarkIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

// Container para múltiplas notificações
interface EnhancedToastContainerProps {
  toasts: EnhancedToastProps[];
  onRemove: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  maxToasts?: number;
}

export function EnhancedToastContainer({
  toasts,
  onRemove,
  position = 'top-right',
  maxToasts = 5,
}: EnhancedToastContainerProps) {
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <div className='fixed z-50 pointer-events-none'>
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          className='pointer-events-auto'
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: UI_CONSTANTS.Z_INDEX_TOAST - index,
          }}
        >
          <EnhancedToast {...toast} position={position} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  );
}

// Hook para usar notificações
export function useEnhancedToast() {
  const [toasts, setToasts] = useState<EnhancedToastProps[]>([]);

  const addToast = (toast: Omit<EnhancedToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast: EnhancedToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, description?: string, action?: EnhancedToastProps['action']) => {
    addToast({ title, description, type: 'success', action });
  };

  const error = (title: string, description?: string, action?: EnhancedToastProps['action']) => {
    addToast({ title, description, type: 'error', action });
  };

  const warning = (title: string, description?: string, action?: EnhancedToastProps['action']) => {
    addToast({ title, description, type: 'warning', action });
  };

  const info = (title: string, description?: string, action?: EnhancedToastProps['action']) => {
    addToast({ title, description, type: 'info', action });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
