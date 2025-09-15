/**
 * Módulo para testes de webhook do Stripe
 * Permite testar webhooks localmente durante desenvolvimento
 */

// import { stripe } from './stripe'; // Not used in this module
import { logger } from './logger';

export interface WebhookTestEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

export interface WebhookTestResult {
  success: boolean;
  eventId?: string;
  error?: string;
  response?: Record<string, unknown>;
}

/**
 * Cria um evento de teste para webhook do Stripe
 */
export function createTestWebhookEvent(
  eventType: string,
  testData: Record<string, unknown>
): WebhookTestEvent {
  try {
    logger.info(`Creating test webhook event: ${eventType}`);
    
    const testEvent: WebhookTestEvent = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      data: {
        object: testData
      },
      created: Math.floor(Date.now() / 1000)
    };

    logger.debug('Test webhook event created', { eventId: testEvent.id, type: eventType });
    return testEvent;
  } catch (error) {
    logger.error('Failed to create test webhook event', error);
    throw error;
  }
}

/**
 * Valida se um evento de webhook é válido
 */
export function validateWebhookEvent(event: WebhookTestEvent): boolean {
  try {
    if (!event.id || !event.type || !event.data || !event.data.object) {
      logger.warn('Invalid webhook event structure', { event });
      return false;
    }

    if (!event.id.startsWith('evt_')) {
      logger.warn('Invalid webhook event ID format', { eventId: event.id });
      return false;
    }

    logger.debug('Webhook event validation passed', { eventId: event.id, type: event.type });
    return true;
  } catch (error) {
    logger.error('Error validating webhook event', error);
    return false;
  }
}

/**
 * Simula o processamento de um webhook do Stripe
 */
export async function processTestWebhook(
  event: WebhookTestEvent,
  handler: (event: WebhookTestEvent) => Promise<Record<string, unknown>>
): Promise<WebhookTestResult> {
  try {
    logger.info(`Processing test webhook: ${event.type}`, { eventId: event.id });

    if (!validateWebhookEvent(event)) {
      return {
        success: false,
        error: 'Invalid webhook event'
      };
    }

    const response = await handler(event);
    
    logger.info('Test webhook processed successfully', { 
      eventId: event.id, 
      type: event.type 
    });

    return {
      success: true,
      eventId: event.id,
      response
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to process test webhook', { 
      eventId: event.id, 
      error: errorMessage 
    });

    return {
      success: false,
      eventId: event.id,
      error: errorMessage
    };
  }
}

/**
 * Tipos de eventos de teste comuns
 */
export const TEST_EVENT_TYPES = {
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
  PAYMENT_METHOD_DETACHED: 'payment_method.detached'
} as const;

/**
 * Dados de teste para diferentes tipos de eventos
 */
export const TEST_EVENT_DATA = {
  [TEST_EVENT_TYPES.CUSTOMER_CREATED]: {
    id: 'cus_test_customer',
    email: 'test@example.com',
    created: Math.floor(Date.now() / 1000)
  },
  [TEST_EVENT_TYPES.SUBSCRIPTION_CREATED]: {
    id: 'sub_test_subscription',
    customer: 'cus_test_customer',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  },
  [TEST_EVENT_TYPES.INVOICE_PAYMENT_SUCCEEDED]: {
    id: 'in_test_invoice',
    customer: 'cus_test_customer',
    subscription: 'sub_test_subscription',
    amount_paid: 2900,
    currency: 'brl'
  }
} as const;
