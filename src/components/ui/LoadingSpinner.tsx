'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className='h-full w-full animate-spin'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
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
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && <LoadingSpinner size='sm' className='mr-2' />}
      {children}
    </button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingCard({ isLoading, children, className = '' }: LoadingCardProps) {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-3 bg-gray-200 rounded'></div>
            <div className='h-3 bg-gray-200 rounded w-5/6'></div>
            <div className='h-3 bg-gray-200 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
