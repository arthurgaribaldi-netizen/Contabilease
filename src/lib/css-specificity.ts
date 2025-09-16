/**
 * CSS Specificity Utilities for Contabilease
 *
 * Este arquivo fornece utilitários para aplicar classes CSS específicas
 * que evitam conflitos futuros e melhoram a manutenibilidade do código.
 */

import { logger } from './logger';

/**
 * Namespace base da aplicação
 */
export const CSS_NAMESPACE = 'contabilease';

/**
 * Classes específicas para componentes principais
 */
export const SPECIFIC_CLASSES = {
  // Layout
  app: `${CSS_NAMESPACE}-app`,
  container: `${CSS_NAMESPACE}-container`,
  minHeightScreen: `${CSS_NAMESPACE}-min-h-screen`,

  // Tipografia
  heading: `${CSS_NAMESPACE}-heading`,
  paragraph: `${CSS_NAMESPACE}-paragraph`,

  // Componentes UI
  button: `${CSS_NAMESPACE}-button`,
  card: `${CSS_NAMESPACE}-card`,
  cardHeader: `${CSS_NAMESPACE}-card-header`,
  cardTitle: `${CSS_NAMESPACE}-card-title`,
  cardDescription: `${CSS_NAMESPACE}-card-description`,
  cardContent: `${CSS_NAMESPACE}-card-content`,
  cardFooter: `${CSS_NAMESPACE}-card-footer`,
  input: `${CSS_NAMESPACE}-input`,
  form: `${CSS_NAMESPACE}-form`,
  modal: `${CSS_NAMESPACE}-modal`,

  // Contextos específicos
  auth: `${CSS_NAMESPACE}-auth`,
  dashboard: `${CSS_NAMESPACE}-dashboard`,
  contracts: `${CSS_NAMESPACE}-contracts`,

  // Estados e animações
  tourHighlight: `${CSS_NAMESPACE}-tour-highlight`,
  animateShake: `${CSS_NAMESPACE}-animate-shake`,
  animateFadeIn: `${CSS_NAMESPACE}-animate-fade-in`,
  highContrast: `${CSS_NAMESPACE}-high-contrast`,

  // Cores específicas
  bgWhite: `${CSS_NAMESPACE}-bg-white`,
  bgGray50: `${CSS_NAMESPACE}-bg-gray-50`,
  bgGray100: `${CSS_NAMESPACE}-bg-gray-100`,
  bgGray200: `${CSS_NAMESPACE}-bg-gray-200`,
  textGray900: `${CSS_NAMESPACE}-text-gray-900`,
  textGray700: `${CSS_NAMESPACE}-text-gray-700`,
  textGray600: `${CSS_NAMESPACE}-text-gray-600`,
  textGray500: `${CSS_NAMESPACE}-text-gray-500`,
  borderGray200: `${CSS_NAMESPACE}-border-gray-200`,
  borderGray300: `${CSS_NAMESPACE}-border-gray-300`,
  bgBlue600: `${CSS_NAMESPACE}-bg-blue-600`,
} as const;

/**
 * Função para criar classes específicas por contexto
 */
export function createContextualClasses(context: string) {
  return {
    container: `${CSS_NAMESPACE}-${context}`,
    form: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-form`,
    button: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-button`,
    card: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-card`,
    input: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-input`,
    table: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-table`,
    modal: `${CSS_NAMESPACE}-${context} ${CSS_NAMESPACE}-modal`,
  };
}

/**
 * Contextos específicos da aplicação
 */
export const CONTEXTUAL_CLASSES = {
  auth: createContextualClasses('auth'),
  dashboard: createContextualClasses('dashboard'),
  contracts: createContextualClasses('contracts'),
  reports: createContextualClasses('reports'),
  settings: createContextualClasses('settings'),
} as const;

/**
 * Função para combinar classes específicas com Tailwind
 */
export function combineSpecificClasses(
  specificClass: string,
  tailwindClasses: string = ''
): string {
  return `${specificClass} ${tailwindClasses}`.trim();
}

/**
 * Hook para usar classes específicas em componentes React
 */
export function useSpecificClasses() {
  return {
    classes: SPECIFIC_CLASSES,
    contextual: CONTEXTUAL_CLASSES,
    combine: combineSpecificClasses,
    createContextual: createContextualClasses,
  };
}

/**
 * Tipos TypeScript para as classes específicas
 */
export type SpecificClass = (typeof SPECIFIC_CLASSES)[keyof typeof SPECIFIC_CLASSES];
export type ContextualClass = (typeof CONTEXTUAL_CLASSES)[keyof typeof CONTEXTUAL_CLASSES];

/**
 * Validação de classes específicas
 */
export function isValidSpecificClass(className: string): boolean {
  return Object.values(SPECIFIC_CLASSES).includes(className as SpecificClass);
}

/**
 * Extrai o contexto de uma classe específica
 */
export function extractContextFromClass(className: string): string | null {
  const match = className.match(new RegExp(`^${CSS_NAMESPACE}-([^-]+)`));
  return match ? match[1] : null;
}

/**
 * Gera classes específicas dinamicamente
 */
export function generateSpecificClass(component: string, variant?: string, state?: string): string {
  let className = `${CSS_NAMESPACE}-${component}`;

  if (variant) {
    className += `-${variant}`;
  }

  if (state) {
    className += `-${state}`;
  }

  return className;
}

/**
 * Utilitário para debugging de classes específicas
 */
export function debugSpecificClasses(element: HTMLElement): void {
  const specificClasses = Array.from(element.classList).filter(className =>
    className.startsWith(CSS_NAMESPACE)
  );

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(
      `Specific Classes Debug - ${element.tagName}`,
      {
        component: 'css-specificity',
        operation: 'debugSpecificClasses',
        tagName: element.tagName,
      },
      undefined,
      {
        element: element,
        specificClasses,
        context: specificClasses.map(extractContextFromClass).filter(Boolean),
      }
    );
  }
}
