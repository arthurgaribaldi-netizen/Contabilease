'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  animated?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      animated = true,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const Comp = animated ? motion.input : 'input';

    const motionProps = animated
      ? {
          whileFocus: { scale: 1.01 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        }
      : {};

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              error ? 'text-red-600' : 'text-gray-700',
              isFocused && 'text-blue-600'
            )}
            animate={{
              color: error ? '#dc2626' : isFocused ? '#2563eb' : '#374151',
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <Comp
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              error && 'border-red-500 focus-visible:ring-red-500',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...motionProps}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {/* Focus indicator */}
          {animated && isFocused && (
            <motion.div
              className="absolute inset-0 rounded-md border-2 border-blue-500 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 text-sm text-red-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-gray-500"
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
