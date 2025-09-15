'use client';

import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Live activity component
export function LiveActivity() {
  const [activities, setActivities] = useState([
    { id: 1, user: 'Maria S.', action: 'criou um contrato', time: '2 min atrás' },
    { id: 2, user: 'João P.', action: 'gerou relatório', time: '5 min atrás' },
    { id: 3, user: 'Ana L.', action: 'economizou 3h', time: '8 min atrás' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = {
          id: Date.now(),
          user: ['Carlos M.', 'Paula R.', 'Roberto S.', 'Fernanda K.'][Math.floor(Math.random() * 4)],
          action: ['criou contrato', 'gerou relatório', 'economizou tempo'][Math.floor(Math.random() * 3)],
          time: 'agora mesmo'
        };
        return [newActivity, ...prev.slice(0, 2)];
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Atividade ao vivo</span>
      </div>
      
      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 text-sm text-gray-600 mb-2"
          >
            <span className="font-medium">{activity.user}</span>
            <span>{activity.action}</span>
            <span className="text-gray-400">{activity.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Teste grátis component
export function UrgencyTimer() {
  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <ClockIcon className="h-5 w-5" />
        <span className="font-semibold">Teste grátis disponível:</span>
      </div>
      <div className="flex justify-center space-x-2">
        <div className="bg-white/20 rounded-lg p-2 min-w-[50px]">
          <div className="text-2xl font-bold">30</div>
          <div className="text-xs">dias</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 min-w-[50px]">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs">R$</div>
        </div>
      </div>
    </div>
  );
}

// Social proof counter
export function SocialProofCounter() {
  return (
    <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <UsersIcon className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold text-blue-900">
          Contadores profissionais já economizam tempo
        </span>
      </div>
      <p className="text-sm text-blue-700">
        Junte-se a profissionais que substituíram Excel pelo Contabilease
      </p>
    </div>
  );
}

// Trust badges
export function TrustBadges() {
  const badges = [
    { icon: ShieldCheckIcon, text: 'SSL Seguro', color: 'green' },
    { icon: CheckCircleIcon, text: 'Conformidade IFRS 16', color: 'blue' },
    { icon: UsersIcon, text: 'Usuários Profissionais', color: 'purple' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-${badge.color}-50 border border-${badge.color}-200`}
        >
          <badge.icon className={`h-5 w-5 text-${badge.color}-600`} />
          <span className={`text-sm font-medium text-${badge.color}-800`}>
            {badge.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Floating CTA
export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Removido timer fictício - usar apenas elementos visuais de urgência

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm">
            {/* Teste Grátis */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-3 mb-3 text-center">
              <div className="text-xs font-semibold mb-1">Teste grátis:</div>
              <div className="flex justify-center space-x-1">
                <div className="bg-white/20 rounded px-2 py-1">
                  <div className="text-lg font-bold">30</div>
                  <div className="text-xs">dias</div>
                </div>
                <div className="bg-white/20 rounded px-2 py-1">
                  <div className="text-lg font-bold">0</div>
                  <div className="text-xs">R$</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">🚀</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Teste grátis!</div>
                <div className="text-sm text-gray-600">Comece agora sem compromisso</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-105">
              🚀 Começar Teste Grátis
            </button>
            <div className="text-xs text-center text-gray-500 mt-2">
              ✅ Sem cartão • ✅ 30 dias grátis
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Risk reversal component
export function RiskReversal() {
  return (
    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
      <div className="flex items-center space-x-3 mb-3">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">
          Garantia de 30 dias
        </h3>
      </div>
      <p className="text-green-800 text-sm mb-4">
        Se você não economizar pelo menos 2 horas no primeiro contrato, 
        devolvemos seu dinheiro. Sem perguntas.
      </p>
      <div className="space-y-2 text-sm text-green-700">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-4 w-4" />
          <span>Teste grátis por 30 dias</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-4 w-4" />
          <span>Sem cartão de crédito</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-4 w-4" />
          <span>Suporte especializado incluído</span>
        </div>
      </div>
    </div>
  );
}
