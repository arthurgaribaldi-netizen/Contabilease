'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import AccessibilitySettings from '@/components/ui/AccessibilitySettings';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
  AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  CalculatorIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  HomeIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'yellow' | 'blue';
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { toasts, removeToast } = useToast();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Skip locale segment if present
    const startIndex =
      pathSegments[0] === 'pt-BR' || pathSegments[0] === 'en' || pathSegments[0] === 'es' ? 1 : 0;

    for (let i = startIndex; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (!segment) continue;
      const href = '/' + pathSegments.slice(0, i + 1).join('/');

      let name = segment;
      switch (segment) {
        case 'dashboard':
          name = 'Dashboard';
          break;
        case 'contracts':
          name = 'Contratos';
          break;
        case 'new':
          name = 'Novo Contrato';
          break;
        case 'ifrs16-demo':
          name = 'Conformidade IFRS 16';
          break;
        case 'contract-modifications-demo':
          name = 'Modificações';
          break;
        case 'reports':
          name = 'Relatórios';
          break;
        case 'settings':
          name = 'Configurações';
          break;
        default:
          name = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        name,
        href: i === pathSegments.length - 1 ? '' : href,
        current: i === pathSegments.length - 1,
      });
    }

    return breadcrumbs;
  };

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    {
      name: 'Contratos',
      href: '/contracts',
      icon: DocumentTextIcon,
      badge: '12',
      badgeColor: 'blue',
    },
    { name: 'Novo Contrato', href: '/contracts/new', icon: CalculatorIcon },
    {
      name: 'Conformidade IFRS 16',
      href: '/ifrs16-demo',
      icon: CheckCircleIcon,
      badge: '83%',
      badgeColor: 'green',
    },
    {
      name: 'Modificações',
      href: '/contract-modifications-demo',
      icon: ClipboardDocumentListIcon,
      badge: '2',
      badgeColor: 'yellow',
    },
    { name: 'Relatórios', href: '/reports', icon: DocumentChartBarIcon },
    { name: 'Configurações', href: '/settings', icon: CogIcon },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm'
          onClick={() => setSidebarOpen(false)}
          aria-hidden='true'
        />
        <div className='fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r border-border shadow-xl'>
          <div className='flex h-16 items-center justify-between px-4'>
            <h1 className='text-xl font-bold text-foreground'>Contabilease</h1>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSidebarOpen(false)}
              aria-label='Fechar menu'
            >
              <XMarkIcon className='h-6 w-6' />
            </Button>
          </div>
          <nav className='flex-1 space-y-1 px-2 py-4' role='navigation' aria-label='Menu principal'>
            {navigation.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className='flex items-center'>
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                      aria-hidden='true'
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getBadgeColor(item.badgeColor)
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className='border-t border-border p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <UserIcon className='h-8 w-8 rounded-full bg-muted text-muted-foreground' />
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-foreground'>{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className='text-xs text-muted-foreground hover:text-foreground flex items-center'
                >
                  <ArrowRightOnRectangleIcon className='h-4 w-4 mr-1' />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col'>
        <div className='flex flex-col flex-grow bg-card border-r border-border'>
          <div className='flex h-16 items-center px-4'>
            <h1 className='text-xl font-bold text-foreground'>Contabilease</h1>
          </div>
          <nav className='flex-1 space-y-1 px-2 py-4' role='navigation' aria-label='Menu principal'>
            {navigation.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className='flex items-center'>
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                      aria-hidden='true'
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getBadgeColor(item.badgeColor)
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className='border-t border-border p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <UserIcon className='h-8 w-8 rounded-full bg-muted text-muted-foreground' />
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-foreground'>{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className='text-xs text-muted-foreground hover:text-foreground flex items-center'
                >
                  <ArrowRightOnRectangleIcon className='h-4 w-4 mr-1' />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top bar */}
        <div className='sticky top-0 z-40 border-b border-border bg-card shadow-sm'>
          <div className='flex h-16 shrink-0 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8'>
            <Button
              variant='ghost'
              size='icon'
              className='-m-2.5 p-2.5 text-foreground lg:hidden'
              onClick={() => setSidebarOpen(true)}
              aria-label='Abrir menu'
            >
              <Bars3Icon className='h-6 w-6' />
            </Button>
            <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
              <div className='flex flex-1 items-center'>
                <Breadcrumbs items={generateBreadcrumbs()} />
              </div>
              <div className='flex items-center gap-x-4 lg:gap-x-6'>
                <button
                  onClick={() => setAccessibilityOpen(true)}
                  className='p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md'
                  aria-label='Configurações de acessibilidade'
                  title='Configurações de acessibilidade'
                >
                  <AdjustmentsHorizontalIcon className='h-5 w-5' />
                </button>
                <ThemeToggle />
                <div className='hidden lg:block lg:h-6 lg:w-px lg:bg-border' />
                <div className='flex items-center gap-x-2'>
                  <span className='text-sm text-foreground'>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='py-6'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>{children}</div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Accessibility Settings Modal */}
      <AccessibilitySettings
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />
    </div>
  );
}
