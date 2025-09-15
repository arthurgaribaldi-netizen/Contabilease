import { logger } from '@/lib/logger';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planName = session.metadata?.planName;
  const customerId = session.customer as string;

  if (!userId || !planName) {
    logger.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Get plan details
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', planName)
    .single();

  if (!plan) {
    logger.error('Plan not found:', planName);
    return;
  }

  // Create or update user subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: plan.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string,
      status: 'active',
      current_period_start: new Date(session.subscription_details?.metadata?.current_period_start || Date.now()),
      current_period_end: new Date(session.subscription_details?.metadata?.current_period_end || Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

  if (error) {
    logger.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get user by customer ID
  const { data: userSubscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!userSubscription) {
    logger.error('User subscription not found for customer:', customerId);
    return;
  }

  // Update subscription with Stripe subscription ID
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq('user_id', userSubscription.user_id);

  if (error) {
    logger.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logger.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logger.error('Error canceling subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    logger.error('Error updating subscription status:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    logger.error('Error updating subscription status:', error);
  }
}
