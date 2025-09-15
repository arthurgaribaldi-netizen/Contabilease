# DashboardLayout

O `DashboardLayout` é o componente principal que fornece a estrutura de navegação e layout para todas as páginas protegidas do Contabilease.

## Características

- **Navegação lateral responsiva**: Sidebar que se adapta a diferentes tamanhos de tela
- **Menu mobile**: Hamburger menu para dispositivos móveis
- **Integração com autenticação**: Mostra informações do usuário e botão de logout
- **Design moderno**: Interface limpa e profissional usando Tailwind CSS
- **Navegação ativa**: Destaca a página atual no menu

## Estrutura

### Navegação Principal
- Dashboard
- Transações
- Categorias
- Relatórios
- Configurações

### Funcionalidades
- **Sidebar fixa**: No desktop, a sidebar fica fixa à esquerda
- **Menu mobile**: No mobile, a sidebar se transforma em um overlay
- **Informações do usuário**: Mostra email do usuário logado
- **Logout**: Botão para sair da aplicação
- **Top bar**: Barra superior com informações do usuário (mobile)

## Uso

O layout é automaticamente aplicado a todas as páginas dentro da pasta `(protected)` através do arquivo `layout.tsx`.

```tsx
// src/app/[locale]/(protected)/layout.tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

## Personalização

### Adicionando novas rotas de navegação

Para adicionar uma nova rota ao menu de navegação, edite o array `navigation` no componente `DashboardLayout`:

```tsx
const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transações', href: '/transactions', icon: CreditCardIcon },
  { name: 'Categorias', href: '/categories', icon: TagIcon },
  { name: 'Relatórios', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Configurações', href: '/settings', icon: CogIcon },
  // Adicione sua nova rota aqui
  { name: 'Nova Página', href: '/nova-pagina', icon: NovaIcon },
];
```

### Modificando o design

O layout usa Tailwind CSS para estilização. As principais classes utilizadas:

- **Sidebar**: `bg-white border-r border-gray-200`
- **Navegação ativa**: `bg-primary-100 text-primary-700`
- **Hover states**: `hover:bg-gray-50 hover:text-gray-900`
- **Responsividade**: `lg:fixed lg:inset-y-0 lg:flex lg:w-64`

## Dependências

- `@heroicons/react`: Para os ícones da navegação
- `next/link`: Para navegação entre páginas
- `next/navigation`: Para detectar a rota atual
- `@/components/auth/AuthProvider`: Para informações de autenticação

## Responsividade

- **Desktop (lg+)**: Sidebar fixa de 256px (w-64)
- **Tablet/Mobile**: Sidebar como overlay com backdrop
- **Breakpoints**: Usa o sistema de breakpoints do Tailwind CSS

## Acessibilidade

- Navegação por teclado
- Contraste adequado
- Labels descritivos
- Foco visível nos elementos interativos
