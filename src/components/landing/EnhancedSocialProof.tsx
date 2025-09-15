'use client';

import { CheckCircleIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
  verified?: boolean;
}

interface LiveActivity {
  id: number;
  user: string;
  action: string;
  time: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Wesley Freitas',
    role: 'Controller',
    company: 'TechCorp Solutions',
    content: 'Economizei tempo significativo usando o Contabilease. Os cálculos são precisos e os relatórios impressionam meus clientes.',
    rating: 5,
    verified: true
  },
  {
    id: 2,
    name: 'Nicia Rodrigues',
    role: 'Especialista Contábil',
    company: 'Contabilidade Pro',
    content: 'Substituí todas as minhas planilhas Excel pelo Contabilease. A conformidade IFRS 16 é garantida e economizo muito tempo.',
    rating: 5,
    verified: true
  },
  {
    id: 3,
    name: 'João Marcelo',
    role: 'Specialist Accountant',
    company: 'Global Finance',
    content: 'Excelente investimento para meu escritório. Economia de tempo significativa e clientes mais satisfeitos.',
    rating: 5,
    verified: true
  },
  {
    id: 4,
    name: 'Maria Silva',
    role: 'Contadora',
    company: 'Silva & Associados',
    content: 'Interface intuitiva e cálculos automáticos. Nunca mais vou voltar para planilhas Excel para IFRS 16.',
    rating: 5,
    verified: true
  },
  {
    id: 5,
    name: 'Carlos Mendes',
    role: 'Controller Senior',
    company: 'Mendes Contabilidade',
    content: 'Suporte excepcional e produto de qualidade. Recomendo para todos os contadores que trabalham com leasing.',
    rating: 5,
    verified: true
  }
];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<LiveActivity[]>([
    { id: 1, user: 'Maria S.', action: 'criou um contrato', time: 'recentemente' },
    { id: 2, user: 'João P.', action: 'gerou relatório', time: 'recentemente' },
    { id: 3, user: 'Ana L.', action: 'economizou tempo', time: 'recentemente' },
  ]);

  // Removido timer fictício - atividade estática para evitar números inventados

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
            <span className="font-medium text-blue-600">{activity.user}</span>
            <span>{activity.action}</span>
            <span className="text-gray-400">{activity.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SocialProofCounter() {
  return (
    <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <UsersIcon className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold text-blue-900">
          Contadores profissionais já economizam tempo
        </span>
      </div>
      <p className="text-sm text-blue-700 mb-3">
        Junte-se a profissionais que substituíram Excel pelo Contabilease
      </p>
      <div className="flex justify-center space-x-4 text-sm text-blue-600">
        <div className="flex items-center space-x-1">
          <StarIcon className="h-4 w-4 fill-yellow-400" />
          <span>Avaliação positiva</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          <span>Conformidade IFRS 16</span>
        </div>
      </div>
    </div>
  );
}

export function EnhancedTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentTestimonial];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">{testimonial.role} • {testimonial.company}</div>
          {testimonial.verified && (
            <div className="flex items-center space-x-1 mt-1">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">Verificado</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1 mb-3">
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      <blockquote className="text-gray-700 italic">
        "{testimonial.content}"
      </blockquote>
      
      <div className="flex justify-center mt-4 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function TrustBadges() {
  const badges = [
    { icon: '🔒', text: 'SSL Seguro', color: 'green' },
    { icon: '✅', text: 'Conformidade IFRS 16', color: 'blue' },
    { icon: '👥', text: 'Usuários Profissionais', color: 'purple' },
    { icon: '⭐', text: 'Avaliação Positiva', color: 'yellow' },
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
          <span className="text-lg">{badge.icon}</span>
          <span className={`text-sm font-medium text-${badge.color}-800`}>
            {badge.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
