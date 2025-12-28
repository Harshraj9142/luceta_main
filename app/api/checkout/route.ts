import { NextRequest, NextResponse } from 'next/server';
import { DodoPaymentsClient, CheckoutSessionData, getProductById } from '@/lib/dodo-payments';
import { z } from 'zod';

// Validation schema for checkout requests
const checkoutRequestSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  customer: z.object({
    email: z.string().min(1, 'Email is required'), // Allow any string, Dodo will validate
    name: z.string().min(1, 'Name is required'),
    phone_number: z.string().optional(),
  }),
  billing_address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(2, 'Country code is required'),
    zipcode: z.string().min(1, 'Zip code is required'),
  }).optional(),
  quantity: z.number().min(1).default(1),
  plan_type: z.enum(['monthly', 'yearly']).default('monthly'),
});

// Initialize Dodo Payments client
const dodoClient = new DodoPaymentsClient({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' || 'test_mode',
  returnUrl: process.env.NEXT_PUBLIC_RETURN_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkoutRequestSchema.parse(body);

    // Verify product exists
    const product = getProductById(validatedData.product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Prepare checkout session data
    const checkoutData: CheckoutSessionData = {
      product_cart: [{
        product_id: validatedData.product_id,
        quantity: validatedData.quantity,
      }],
      customer: validatedData.customer,
      billing_address: validatedData.billing_address,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?product=${validatedData.product_id}&plan=${validatedData.plan_type}`,
      metadata: {
        platform: 'luceta-audio',
        source: 'pricing_page',
        plan_type: validatedData.plan_type,
        product_name: product.name,
        product_category: product.category,
      },
    };

    // Create checkout session
    const paymentResponse = await dodoClient.createCheckoutSession(checkoutData);

    return NextResponse.json({
      success: true,
      checkout_url: paymentResponse.checkout_url,
      session_id: paymentResponse.session_id,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });

  } catch (error) {
    console.error('Checkout API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Checkout failed',
        details: 'Please try again or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for quick product checkout (static links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // For GET requests, create a simple payment link
    const paymentData = {
      product_id: productId,
      quantity: 1,
      customer: {
        email: email || 'customer@example.com',
        name: name || 'Luceta Customer',
      },
      billing_address: {
        street: '123 Audio Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        zipcode: '94102'
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?product=${productId}`,
      metadata: {
        platform: 'luceta-audio',
        source: 'quick_link',
        product_name: product.name,
        product_category: product.category,
      },
    };

    const paymentResponse = await dodoClient.createPaymentLink(paymentData);

    return NextResponse.json({
      success: true,
      checkout_url: paymentResponse.checkout_url,
      payment_id: paymentResponse.payment_id,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });

  } catch (error) {
    console.error('Quick checkout API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Quick checkout failed',
        details: 'Please try again or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}