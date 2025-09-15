'use client';

import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Eye,
    Moon,
    Palette,
    Sparkles,
    Sun,
    Zap
} from 'lucide-react';
import { Button } from './button';
import { AnimatedCard, DarkModeCard, GradientCard, ShimmerCard } from './dark-mode-card';
import { SimpleThemeToggle, ThemeToggle } from './theme-toggle';

export function DarkModeDemo() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const cards = [
    {
      title: 'Card Padrão',
      description: 'Card com estilo padrão que se adapta ao tema',
      component: DarkModeCard
    },
    {
      title: 'Card com Gradiente',
      description: 'Card com gradiente que muda no modo escuro',
      component: GradientCard
    },
    {
      title: 'Card com Brilho',
      description: 'Card com efeito shimmer animado',
      component: ShimmerCard
    },
    {
      title: 'Card Animado',
      description: 'Card com animação de entrada escalonada',
      component: AnimatedCard
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ 
                  rotate: isDark ? 360 : 0,
                  scale: isDark ? 1.1 : 1
                }}
                transition={{ duration: 0.5 }}
                className="p-4 rounded-full bg-gradient-to-br from-primary to-accent"
              >
                {isDark ? (
                  <Moon className="h-8 w-8 text-white" />
                ) : (
                  <Sun className="h-8 w-8 text-white" />
                )}
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Modo Escuro Moderno
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Experiência visual aprimorada com transições suaves e design adaptativo
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <SimpleThemeToggle />
              <ThemeToggle variant="default" />
              <Button onClick={toggleTheme} variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Alternar Tema
              </Button>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-muted/50 inline-block">
              <p className="text-sm text-muted-foreground">
                Tema atual: <span className="font-semibold text-foreground">{theme}</span> 
                {' '}({resolvedTheme})
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Componentes Adaptativos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todos os componentes se adaptam automaticamente ao tema selecionado,
              proporcionando uma experiência visual consistente e moderna.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const CardComponent = card.component;
              return (
                <CardComponent key={card.title} delay={index}>
                  <div className="flex items-center mb-3">
                    <div className={cn(
                      'p-2 rounded-lg mr-3',
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    )}>
                      <Palette className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{card.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {card.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardComponent>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Características do Modo Escuro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Implementação moderna seguindo as melhores práticas de UX/UI de 2025
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <div className={cn(
                'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              )}>
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transições Suaves</h3>
              <p className="text-muted-foreground">
                Animações fluidas entre temas com duração otimizada para melhor experiência
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className={cn(
                'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              )}>
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detecção Automática</h3>
              <p className="text-muted-foreground">
                Respeita as preferências do sistema operacional automaticamente
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center"
            >
              <div className={cn(
                'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              )}>
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Otimizada</h3>
              <p className="text-muted-foreground">
                Carregamento rápido sem flash de conteúdo não estilizado
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Theme Controls Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">Controles de Tema</h2>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Toggle Simples</h3>
                <div className="flex justify-center">
                  <SimpleThemeToggle />
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Menu Dropdown</h3>
                <div className="flex justify-center">
                  <ThemeToggle variant="dropdown" />
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Botão com Ícone</h3>
                <div className="flex justify-center">
                  <ThemeToggle variant="icon" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
