'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorFallback } from './ErrorFallbacks';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para capturar e tratar erros JavaScript em componentes React
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para monitoramento
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Chama callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Envia erro para serviço de monitoramento (ex: Sentry)
    this.reportError(error, errorInfo);
  }

  private reportError = (_error: Error, _errorInfo: ErrorInfo) => {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Exemplo de integração com Sentry
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack,
      //     },
      //   },
      // });
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorDetails() {
    if (process.env.NODE_ENV !== 'development' || !this.state.error) {
      return null;
    }

    return (
      <details className='mb-6 text-left'>
        <summary className='cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Detalhes do erro (desenvolvimento)
        </summary>
        <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto'>
          <div className='mb-2'>
            <strong>Erro:</strong> {this.state.error.toString()}
          </div>
          {this.state.errorInfo && (
            <div>
              <strong>Stack:</strong>
              <pre className='whitespace-pre-wrap mt-1'>{this.state.errorInfo.componentStack}</pre>
            </div>
          )}
        </div>
      </details>
    );
  }

  private renderErrorActions() {
    return (
      <div className='flex space-x-3 justify-center'>
        <button
          onClick={this.handleRetry}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
        >
          <RefreshCw className='w-4 h-4 mr-2' />
          Tentar novamente
        </button>

        <button
          onClick={this.handleGoHome}
          className='inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
        >
          <Home className='w-4 h-4 mr-2' />
          Ir para início
        </button>
      </div>
    );
  }

  private renderDefaultErrorUI() {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6'>
          <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4'>
            <AlertTriangle className='w-6 h-6 text-red-600 dark:text-red-400' />
          </div>

          <div className='text-center'>
            <h1 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              Oops! Algo deu errado
            </h1>

            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para
              corrigi-lo.
            </p>

            {this.renderErrorDetails()}
            {this.renderErrorActions()}
          </div>
        </div>
      </div>
    );
  }

  override render() {
    if (this.state.hasError) {
      // Renderiza UI de erro personalizada se fornecida
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderDefaultErrorUI();
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary em componentes funcionais
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

/**
 * Componente wrapper para Error Boundary com configurações específicas
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  level = 'component',
  showDetails = false,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`Error in ${level} level:`, error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      fallback={showDetails ? undefined : getErrorFallback(level)}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
