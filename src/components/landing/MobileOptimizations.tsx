'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

// Mobile-first navigation
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu de navegação"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Fechar menu"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <nav className="space-y-4">
                  <a
                    href="#demo"
                    className="block py-3 px-4 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Demonstração
                  </a>
                  <a
                    href="#pricing"
                    className="block py-3 px-4 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Preços
                  </a>
                  <a
                    href="#testimonials"
                    className="block py-3 px-4 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Depoimentos
                  </a>
                  <a
                    href="/pt-BR/auth/login"
                    className="block py-3 px-4 rounded-lg bg-blue-600 text-white font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Teste Grátis
                  </a>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Touch-friendly buttons
export function TouchButton({ 
  children, 
  className = "",
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] touch-manipulation ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-optimized pricing cards
export function MobilePricingCard({ 
  plan, 
  isPopular = false 
}: { 
  plan: any; 
  isPopular?: boolean;
}) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
        isPopular 
          ? 'border-blue-500 shadow-lg scale-105' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Mais Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <div className="mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {plan.price}
          </span>
          <span className="text-gray-600 ml-1">
            {plan.period}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          {plan.description}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {plan.features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 text-sm">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <TouchButton
        className={`w-full py-3 font-semibold rounded-lg transition-colors ${
          isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {plan.cta}
      </TouchButton>
    </motion.div>
  );
}

// Swipeable testimonials
export function SwipeableTestimonials({ testimonials }: { testimonials: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para depoimento ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe indicators */}
      <div className="flex justify-between mt-4">
        <TouchButton
          onClick={prevTestimonial}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Depoimento anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </TouchButton>
        
        <TouchButton
          onClick={nextTestimonial}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Próximo depoimento"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </TouchButton>
      </div>
    </div>
  );
}

// Mobile-optimized hero section
export function MobileHero() {
  return (
    <div className="lg:hidden space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Substitua sua{' '}
          <span className="text-red-600 line-through">planilha Excel</span>{' '}
          por cálculos automáticos de IFRS 16
        </h1>
        
        <p className="text-lg text-gray-600 leading-relaxed px-4">
          Economize <strong>2 horas por contrato</strong> com cálculos automáticos, 
          relatórios profissionais e backup seguro. 
          <span className="text-green-600 font-semibold"> Por apenas R$ 29/mês.</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <TouchButton className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg">
          Teste Grátis por 30 dias
        </TouchButton>
        
        <TouchButton className="w-full border-2 border-gray-300 hover:border-gray-400 py-4 text-lg font-semibold rounded-lg">
          Ver Demonstração
        </TouchButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl p-4 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Por que contadores escolhem o Contabilease?
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Economia de tempo</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Zero erros</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Relatórios profissionais</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Backup automático</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
