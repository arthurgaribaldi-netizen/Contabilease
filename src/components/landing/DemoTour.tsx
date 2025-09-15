'use client';

import { Button } from '@/components/ui/button';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  target: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    title: 'Selecione um Contrato',
    description: 'Escolha entre diferentes tipos de contratos de leasing para ver os cálculos em ação.',
    position: 'right',
    target: 'contract-selection'
  },
  {
    id: 'step-2',
    title: 'Veja os Cálculos',
    description: 'Os valores IFRS 16 são calculados automaticamente em tempo real.',
    position: 'left',
    target: 'calculation-results'
  },
  {
    id: 'step-3',
    title: 'Compare com Excel',
    description: 'Veja a diferença entre planilhas Excel e o Contabilease.',
    position: 'top',
    target: 'comparison-panel'
  },
  {
    id: 'step-4',
    title: 'Calcule seu ROI',
    description: 'Descubra quanto você pode economizar com base no seu volume.',
    position: 'bottom',
    target: 'roi-simulator'
  }
];

interface DemoTourProps {
  onClose: () => void;
}

export default function DemoTour({ onClose }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTourStep = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>

          {/* Tour Content */}
          <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <InformationCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentTourStep.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {currentTourStep.description}
              </p>
            </div>

            {/* Progress */}
            <div className="bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Anterior</span>
              </Button>

              <div className="text-sm text-gray-500">
                {currentStep + 1} de {TOUR_STEPS.length}
              </div>

              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>
                  {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Próximo'}
                </span>
                {currentStep < TOUR_STEPS.length - 1 && (
                  <ArrowRightIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-2">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Pular tour
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
