'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex ${className}`} aria-label='Breadcrumb'>
      <ol className='flex items-center space-x-4'>
        <li>
          <div>
            <Link href='/dashboard' className='text-gray-400 hover:text-gray-500'>
              <HomeIcon className='h-5 w-5 flex-shrink-0' aria-hidden='true' />
              <span className='sr-only'>Dashboard</span>
            </Link>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={item.name}>
            <div className='flex items-center'>
              <ChevronRightIcon
                className='h-5 w-5 flex-shrink-0 text-gray-400'
                aria-hidden='true'
              />
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className='ml-4 text-sm font-medium text-gray-500 hover:text-gray-700'
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className='ml-4 text-sm font-medium text-gray-900'
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
