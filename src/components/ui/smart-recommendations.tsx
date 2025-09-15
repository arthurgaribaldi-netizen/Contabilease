'use client';

import { useAIPersonalization } from '@/lib/ai-personalization';
import { cn } from '@/lib/utils';
import {
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface SmartRecommendationsProps {
  className?: string;
  maxItems?: number;
}

export function SmartRecommendations({ className, maxItems = 3 }: SmartRecommendationsProps) {
  const { recommendations, dismissRecommendation } = useAIPersonalization();
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);

  const visibleRecommendations = recommendations
    .filter(rec => !dismissedItems.includes(rec.id))
    .slice(0, maxItems);

  const handleDismiss = (id: string) => {
    setDismissedItems(prev => [...prev, id]);
    dismissRecommendation(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <DocumentTextIcon className='h-5 w-5' />;
      case 'report':
        return <ChartBarIcon className='h-5 w-5' />;
      case 'action':
        return <CheckCircleIcon className='h-5 w-5' />;
      case 'tip':
        return <LightBulbIcon className='h-5 w-5' />;
      default:
        return <LightBulbIcon className='h-5 w-5' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (visibleRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border-l-4', className)}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <LightBulbIcon className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg'>Recomendações Inteligentes</CardTitle>
          </div>
          <span className='text-sm text-muted-foreground'>
            {visibleRecommendations.length} item{visibleRecommendations.length !== 1 ? 's' : ''}
          </span>
        </div>
        <CardDescription>Sugestões personalizadas baseadas no seu comportamento</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <AnimatePresence>
          {visibleRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn('p-4 rounded-lg border-l-4', getPriorityColor(recommendation.priority))}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
                  <div className='flex-shrink-0 mt-0.5'>{getIcon(recommendation.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium text-foreground'>{recommendation.title}</h4>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {recommendation.description}
                    </p>
                    {recommendation.actionUrl && recommendation.actionLabel && (
                      <Button asChild variant='outline' size='sm' className='mt-2'>
                        <a href={recommendation.actionUrl} className='flex items-center'>
                          {recommendation.actionLabel}
                          <ArrowRightIcon className='h-3 w-3 ml-1' />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='flex-shrink-0 h-6 w-6'
                  onClick={() => handleDismiss(recommendation.id)}
                >
                  <XMarkIcon className='h-4 w-4' />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
