'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  isVisible: boolean;
  title: string;
  message?: string;
  progress?: number; // 0-100
  indeterminate?: boolean;
  onCancel?: () => void;
}

export default function ProgressIndicator({
  isVisible,
  title,
  message,
  progress = 0,
  indeterminate = false,
  onCancel,
}: ProgressIndicatorProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isVisible && !indeterminate) {
      // Animate progress bar
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, progress, indeterminate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className='text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1'
            >
              <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>

        {message && <p className='text-sm text-gray-600 mb-4'>{message}</p>}

        <div className='w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden'>
          {indeterminate ? (
            <motion.div 
              className='bg-blue-600 h-2 rounded-full'
              animate={{ 
                x: ['-100%', '100%'],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              style={{ width: '30%' }}
            />
          ) : (
            <motion.div
              className='bg-blue-600 h-2 rounded-full'
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}
        </div>

        {!indeterminate && (
          <div className='text-right'>
            <span className='text-sm text-gray-500'>{Math.round(displayProgress)}%</span>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para gerenciar progress
export function useProgress() {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [indeterminate, setIndeterminate] = useState(false);

  const show = (title: string, message?: string, indeterminate = true) => {
    setTitle(title);
    setMessage(message || '');
    setIndeterminate(indeterminate);
    setProgress(0);
    setIsVisible(true);
  };

  const update = (progress: number, message?: string) => {
    setProgress(Math.min(100, Math.max(0, progress)));
    if (message) setMessage(message);
  };

  const hide = () => {
    setIsVisible(false);
    setTitle('');
    setMessage('');
    setProgress(0);
    setIndeterminate(false);
  };

  return {
    isVisible,
    title,
    message,
    progress,
    indeterminate,
    show,
    update,
    hide,
  };
}
