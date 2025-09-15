import { logger } from '@/lib/logger';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planName } = await request.json();

    if (!priceId || !planName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user email
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard?success=true&plan=${encodeURIComponent(planName)}`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planName: planName,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
