'use client';

import { useEffect, useState } from 'react';

interface OnboardingState {
  hasCompletedTour: boolean;
  hasSeenWelcome: boolean;
  lastTourDate: string | null;
  hasCompletedOptimizedOnboarding: boolean;
  firstVictoryAchieved: boolean;
  companyData?: {
    companyName: string;
    industry: string;
    monthlyContracts: string;
  };
}

const ONBOARDING_KEY = 'contabilease-onboarding';

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasCompletedTour: false,
    hasSeenWelcome: false,
    lastTourDate: null,
    hasCompletedOptimizedOnboarding: false,
    firstVictoryAchieved: false,
  });
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    // Load onboarding state from localStorage
    const saved = localStorage.getItem(ONBOARDING_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOnboardingState(parsed);
      } catch (error) {
        console.error('Error parsing onboarding state:', error);
      }
    }
  }, []);

  const saveOnboardingState = (newState: Partial<OnboardingState>) => {
    const updatedState = { ...onboardingState, ...newState };
    setOnboardingState(updatedState);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updatedState));
  };

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const completeTour = () => {
    setIsTourOpen(false);
    saveOnboardingState({
      hasCompletedTour: true,
      lastTourDate: new Date().toISOString(),
    });
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setOnboardingState({
      hasCompletedTour: false,
      hasSeenWelcome: false,
      lastTourDate: null,
      hasCompletedOptimizedOnboarding: false,
      firstVictoryAchieved: false,
    });
  };

  const shouldShowWelcome = () => {
    return !onboardingState.hasSeenWelcome;
  };

  const shouldShowTour = () => {
    // Show tour if never completed or if it's been more than 30 days
    if (!onboardingState.hasCompletedTour) return true;

    if (onboardingState.lastTourDate) {
      const lastTour = new Date(onboardingState.lastTourDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastTour < thirtyDaysAgo;
    }

    return false;
  };

  const markWelcomeSeen = () => {
    saveOnboardingState({ hasSeenWelcome: true });
  };

  // New optimized onboarding functions
  const completeOptimizedOnboarding = (companyData?: any) => {
    saveOnboardingState({
      hasCompletedOptimizedOnboarding: true,
      hasCompletedTour: true, // Mark old tour as completed too
      companyData,
    });
  };

  const achieveFirstVictory = () => {
    saveOnboardingState({ firstVictoryAchieved: true });
  };

  const shouldShowOptimizedOnboarding = () => {
    return !onboardingState.hasCompletedOptimizedOnboarding;
  };

  const hasAchievedFirstVictory = () => {
    return onboardingState.firstVictoryAchieved;
  };

  return {
    onboardingState,
    isTourOpen,
    startTour,
    closeTour,
    completeTour,
    resetOnboarding,
    shouldShowWelcome,
    shouldShowTour,
    markWelcomeSeen,
    // New optimized onboarding functions
    completeOptimizedOnboarding,
    achieveFirstVictory,
    shouldShowOptimizedOnboarding,
    hasAchievedFirstVictory,
  };
}
