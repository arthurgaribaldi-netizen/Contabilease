'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className='h-5 w-5 text-green-600' />;
      case 'error':
        return <XCircleIcon className='h-5 w-5 text-red-600' />;
      case 'warning':
        return <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />;
      case 'info':
        return <InformationCircleIcon className='h-5 w-5 text-blue-600' />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'relative w-full max-w-sm bg-card border border-border rounded-lg shadow-lg',
            'border-l-4',
            getBorderColor()
          )}
        >
          <div className='p-4'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>{getIcon()}</div>
              <div className='ml-3 flex-1'>
                <h3 className='text-sm font-medium text-foreground'>{title}</h3>
                {message && <p className='mt-1 text-sm text-muted-foreground'>{message}</p>}
                {action && (
                  <div className='mt-3'>
                    <button
                      onClick={action.onClick}
                      className='text-sm font-medium text-primary hover:text-primary/80'
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>
              <div className='ml-4 flex-shrink-0'>
                <button
                  onClick={handleClose}
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  <XMarkIcon className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className='absolute bottom-0 left-0 h-1 bg-current opacity-30'
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationContainer({
  notifications,
  onRemove,
  position = 'top-right',
}: NotificationContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={cn('fixed z-50 space-y-2', positionClasses[position])}>
      {notifications.map(notification => (
        <Notification key={notification.id} {...notification} onClose={onRemove} />
      ))}
    </div>
  );
}
