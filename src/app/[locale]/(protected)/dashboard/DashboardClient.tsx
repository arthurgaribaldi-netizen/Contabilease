'use client';

import IFRS16Dashboard from '@/components/dashboard/IFRS16Dashboard';
import { useToast } from '@/components/ui/Toast';
import { SkipLink } from '@/components/ui/skip-link';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAIPersonalization } from '@/lib/ai-personalization';
import { useSustainableDesign } from '@/lib/sustainable-design';
import { Suspense, useEffect, useState } from 'react';

// Lazy load onboarding components
const OnboardingTour = lazy(() => import('@/components/onboarding/OnboardingTour'));
const OptimizedOnboarding = lazy(() => import('@/components/onboarding/OptimizedOnboarding'));
const WelcomeModal = lazy(() => import('@/components/onboarding/WelcomeModal'));

interface PersonalizedLayout {
  showAdvancedMetrics: boolean;
  showQuickActions: boolean;
  showRecommendations: boolean;
  preferredChartType: string;
  showTutorials: boolean;
}

export default function DashboardClient() {
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const { error: showError } = useToast();
  const { 
    isTourOpen, 
    startTour, 
    closeTour, 
    completeTour, 
    shouldShowWelcome, 
    markWelcomeSeen,
    shouldShowOptimizedOnboarding,
    completeOptimizedOnboarding,
    achieveFirstVictory,
    hasAchievedFirstVictory
  } = useOnboarding();

  // AI Personalization
  const { updateBehavior, getPersonalizedLayout } = useAIPersonalization();

  // Sustainable Design
  const { config: sustainableConfig } = useSustainableDesign();

  useEffect(() => {
    updateBehavior('page-view', { page: 'dashboard' });
    
    // Load advanced features after initial render
    const timer = setTimeout(() => {
      setShowAdvancedFeatures(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get personalized layout with proper typing
  const getLayout = (): PersonalizedLayout => {
    const layout = getPersonalizedLayout();
    return {
      showAdvancedMetrics: Boolean(layout['showAdvancedMetrics']),
      showQuickActions: Boolean(layout['showQuickActions']),
      showRecommendations: Boolean(layout['showRecommendations']),
      preferredChartType: String(layout['preferredChartType'] || 'simple'),
      showTutorials: Boolean(layout['showTutorials']),
    };
  };

  const personalizedLayout = getLayout();


  return (
    <div className='space-y-6 relative'>
      {/* Skip Link for Accessibility */}
      <SkipLink href='#main-content'>Pular para conteúdo principal</SkipLink>

      {/* Main Dashboard */}
      <div id='main-content'>
        <IFRS16Dashboard />
      </div>

      {/* Onboarding Modals - Load after initial render */}
      {showAdvancedFeatures && (
        <Suspense fallback={null}>
          {/* Show optimized onboarding for new users */}
          {shouldShowOptimizedOnboarding() ? (
            <OptimizedOnboarding
              isOpen={true}
              onClose={() => completeOptimizedOnboarding()}
              onComplete={() => completeOptimizedOnboarding()}
              onFirstVictory={achieveFirstVictory}
            />
          ) : (
            <>
              <WelcomeModal
                isOpen={shouldShowWelcome()}
                onClose={markWelcomeSeen}
                onStartTour={startTour}
              />
              <OnboardingTour isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />
            </>
          )}
        </Suspense>
      )}
    </div>
  );
}
