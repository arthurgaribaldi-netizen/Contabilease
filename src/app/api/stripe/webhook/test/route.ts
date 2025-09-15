import { logger } from '@/lib/logger';
import {
  createTestWebhookEvent,
  processTestWebhook,
  TEST_EVENT_DATA,
  TEST_EVENT_TYPES,
  type WebhookTestEvent
} from '@/lib/stripe-webhook-testing';
import { NextRequest, NextResponse } from 'next/server';

// HTTP Status Codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Handler para processar eventos de teste de webhook do Stripe
 */
async function handleTestWebhookEvent(event: WebhookTestEvent): Promise<Record<string, unknown>> {
  logger.info(`Processing test webhook event: ${event.type}`, { eventId: event.id });

  switch (event.type) {
    case TEST_EVENT_TYPES.CUSTOMER_CREATED:
      return await handleCustomerCreated(event);
    
    case TEST_EVENT_TYPES.SUBSCRIPTION_CREATED:
      return await handleSubscriptionCreated(event);
    
    case TEST_EVENT_TYPES.INVOICE_PAYMENT_SUCCEEDED:
      return await handleInvoicePaymentSucceeded(event);
    
    default:
      logger.warn(`Unhandled test event type: ${event.type}`);
      return { message: 'Event type not handled in test mode' };
  }
}

/**
 * Processa criação de cliente de teste
 */
async function handleCustomerCreated(event: WebhookTestEvent): Promise<Record<string, unknown>> {
  const customer = event.data.object as { id: string; email: string };
  
  logger.info('Test customer created', { customerId: customer.id, email: customer.email });
  
  return {
    action: 'customer_created',
    customerId: customer.id,
    email: customer.email
  };
}

/**
 * Processa criação de assinatura de teste
 */
async function handleSubscriptionCreated(event: WebhookTestEvent): Promise<Record<string, unknown>> {
  const subscription = event.data.object as { 
    id: string; 
    customer: string; 
    status: string; 
  };
  
  logger.info('Test subscription created', { 
    subscriptionId: subscription.id, 
    customerId: subscription.customer,
    status: subscription.status 
  });
  
  return {
    action: 'subscription_created',
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status
  };
}

/**
 * Processa pagamento de fatura bem-sucedido de teste
 */
async function handleInvoicePaymentSucceeded(event: WebhookTestEvent): Promise<Record<string, unknown>> {
  const invoice = event.data.object as { 
    id: string; 
    customer: string; 
    subscription: string;
    amount_paid: number;
    currency: string;
  };
  
  logger.info('Test invoice payment succeeded', { 
    invoiceId: invoice.id, 
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid,
    currency: invoice.currency
  });
  
  return {
    action: 'payment_succeeded',
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid,
    currency: invoice.currency
  };
}

/**
 * Valida e processa dados de entrada do webhook de teste
 */
async function validateAndProcessTestWebhook(request: NextRequest) {
  const body = await request.json();
  const { eventType, testData } = body;

  if (!eventType) {
    return { error: 'eventType is required', status: HTTP_STATUS.BAD_REQUEST };
  }

  const testEvent = createTestWebhookEvent(
    eventType,
    testData ?? TEST_EVENT_DATA[eventType as keyof typeof TEST_EVENT_DATA] ?? {}
  );

  const result = await processTestWebhook(testEvent, handleTestWebhookEvent);
  
  if (!result.success) {
    logger.error('Test webhook processing failed', { error: result.error });
    return { error: result.error || 'Unknown error', status: HTTP_STATUS.INTERNAL_SERVER_ERROR };
  }

  logger.info('Test webhook processed successfully', { 
    eventId: result.eventId,
    response: result.response 
  });

  return {
    success: true,
    eventId: result.eventId,
    response: result.response
  };
}

/**
 * POST /api/stripe/webhook/test
 * Endpoint para testar webhooks do Stripe localmente
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Test webhook endpoint called');
    const result = await validateAndProcessTestWebhook(request);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Test webhook endpoint error', { error: errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

/**
 * GET /api/stripe/webhook/test
 * Endpoint para listar tipos de eventos de teste disponíveis
 */
export async function GET(): Promise<NextResponse> {
  try {
    logger.info('Test webhook info endpoint called');

    return NextResponse.json({
      availableEventTypes: Object.values(TEST_EVENT_TYPES),
      testEventData: TEST_EVENT_DATA,
      usage: {
        method: 'POST',
        body: {
          eventType: 'string (required)',
          testData: 'object (optional)'
        }
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Test webhook info endpoint error', { error: errorMessage });
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}