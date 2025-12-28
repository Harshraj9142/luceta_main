import { NextRequest, NextResponse } from 'next/server';

// Webhook event types from Dodo Payments
interface DodoWebhookEvent {
  id: string;
  type: 'payment.completed' | 'payment.failed' | 'subscription.created' | 'subscription.cancelled' | 'refund.created';
  data: {
    payment_id?: string;
    subscription_id?: string;
    customer_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, any>;
  };
  created_at: string;
}

// Verify webhook signature (implement based on Dodo Payments documentation)
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // TODO: Implement signature verification based on Dodo Payments webhook security
  // This is a placeholder - you should implement proper signature verification
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('DODO_WEBHOOK_SECRET not configured');
    return true; // Allow in development, but implement proper verification for production
  }
  
  // Implement HMAC signature verification here
  return true;
}

// Handle different webhook events
async function handleWebhookEvent(event: DodoWebhookEvent) {
  console.log(`Processing webhook event: ${event.type}`, event.id);

  switch (event.type) {
    case 'payment.completed':
      await handlePaymentCompleted(event);
      break;
    
    case 'payment.failed':
      await handlePaymentFailed(event);
      break;
    
    case 'subscription.created':
      await handleSubscriptionCreated(event);
      break;
    
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event);
      break;
    
    case 'refund.created':
      await handleRefundCreated(event);
      break;
    
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

async function handlePaymentCompleted(event: DodoWebhookEvent) {
  const { payment_id, customer_id, amount, metadata } = event.data;
  
  console.log('Payment completed:', {
    payment_id,
    customer_id,
    amount,
    platform: metadata?.platform,
    product_name: metadata?.product_name,
    plan_type: metadata?.plan_type,
  });

  // TODO: Implement your business logic here:
  // - Update user subscription status
  // - Send welcome email
  // - Grant access to Luceta audio features
  // - Update analytics/metrics
  
  // Example: Update user in database
  // await updateUserSubscription(customer_id, {
  //   status: 'active',
  //   plan: metadata?.product_category,
  //   payment_id,
  //   activated_at: new Date(),
  // });

  // Example: Send welcome email
  // await sendWelcomeEmail(customer_id, metadata?.product_name);
}

async function handlePaymentFailed(event: DodoWebhookEvent) {
  const { payment_id, customer_id } = event.data;
  
  console.log('Payment failed:', { payment_id, customer_id });

  // TODO: Implement failure handling:
  // - Send payment failure notification
  // - Update user status
  // - Retry logic if applicable
}

async function handleSubscriptionCreated(event: DodoWebhookEvent) {
  const { subscription_id, customer_id, metadata } = event.data;
  
  console.log('Subscription created:', {
    subscription_id,
    customer_id,
    product_name: metadata?.product_name,
  });

  // TODO: Implement subscription logic:
  // - Set up recurring billing
  // - Grant ongoing access
  // - Set up usage tracking
}

async function handleSubscriptionCancelled(event: DodoWebhookEvent) {
  const { subscription_id, customer_id } = event.data;
  
  console.log('Subscription cancelled:', { subscription_id, customer_id });

  // TODO: Implement cancellation logic:
  // - Revoke access at period end
  // - Send cancellation confirmation
  // - Update user status
}

async function handleRefundCreated(event: DodoWebhookEvent) {
  const { payment_id, customer_id, amount } = event.data;
  
  console.log('Refund created:', { payment_id, customer_id, amount });

  // TODO: Implement refund logic:
  // - Revoke access if applicable
  // - Send refund confirmation
  // - Update accounting records
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-dodo-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event: DodoWebhookEvent = JSON.parse(body);

    // Validate event structure
    if (!event.id || !event.type || !event.data) {
      console.error('Invalid webhook event structure:', event);
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Process the webhook event
    await handleWebhookEvent(event);

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook processed successfully',
        event_id: event.id,
        event_type: event.type,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for webhook
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'luceta-dodo-webhooks',
    timestamp: new Date().toISOString(),
  });
}