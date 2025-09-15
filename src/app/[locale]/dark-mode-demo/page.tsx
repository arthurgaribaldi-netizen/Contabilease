import { Header } from '@/components/layout/Header';
import { DarkModeDemo } from '@/components/ui/dark-mode-demo';

export default function DarkModeDemoPage() {
  return (
    <>
      <Header 
        title="Demonstração do Modo Escuro" 
        subtitle="Experiência visual moderna e adaptativa"
        showNotifications={false}
        showSettings={false}
      />
      <DarkModeDemo />
    </>
  );
}

export const metadata = {
  title: 'Modo Escuro - Contabilease',
  description: 'Demonstração do sistema de modo escuro moderno com UX otimizada para 2025',
};
