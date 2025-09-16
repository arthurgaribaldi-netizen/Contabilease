'use client';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Constants
const ANIMATION_DELAY = 10;
const REMOVE_DELAY = 300;
const DEFAULT_TOAST_DURATION = 5000;
const ID_LENGTH = 9;
const ID_START_INDEX = 2;
const RADIX = 36;

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), ANIMATION_DELAY);

    // Auto remove (skip for persistent or loading toasts)
    if (!toast.persistent && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), REMOVE_DELAY);
      }, toast.duration ?? DEFAULT_TOAST_DURATION);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, toast.persistent, toast.type, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className='h-6 w-6 text-green-400' />;
      case 'error':
        return <XCircleIcon className='h-6 w-6 text-red-400' />;
      case 'warning':
        return <ExclamationTriangleIcon className='h-6 w-6 text-yellow-400' />;
      case 'info':
        return <InformationCircleIcon className='h-6 w-6 text-blue-400' />;
      case 'loading':
        return <LoadingSpinner size='sm' className='text-blue-400' />;
      default:
        return <InformationCircleIcon className='h-6 w-6 text-blue-400' />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>{getIcon()}</div>
          <div className='ml-3 w-0 flex-1'>
            <p className='text-sm font-medium text-gray-900'>{toast.title}</p>
            {toast.message && <p className='mt-1 text-sm text-gray-500'>{toast.message}</p>}
            {toast.action && (
              <div className='mt-2'>
                <button
                  onClick={toast.action.onClick}
                  className='text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline'
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className='ml-4 flex-shrink-0 flex'>
            <button
              className='inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onRemove(toast.id), REMOVE_DELAY);
              }}
            >
              <XMarkIcon className='h-5 w-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className='fixed top-4 right-4 z-50 space-y-4'>
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook para usar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(RADIX).substr(ID_START_INDEX, ID_LENGTH);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message: message ?? '' });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message: message ?? '' });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message: message ?? '' });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message: message ?? '' });
  };

  const loading = (title: string, message?: string) => {
    addToast({ type: 'loading', title, message: message ?? '', persistent: true });
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
  };
}
