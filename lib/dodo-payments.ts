// Dodo Payments integration for Luceta Audio Platform
import DodoPayments from 'dodopayments';

export interface AudioProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'pro' | 'enterprise';
  features: string[];
}

export interface CheckoutSessionData {
  product_cart: Array<{
    product_id: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  return_url: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  checkout_url: string;
  session_id: string;
  payment_id?: string;
}

export interface DodoPaymentsConfig {
  bearerToken: string;
  environment: 'test_mode' | 'live_mode';
  returnUrl: string;
}

export class DodoPaymentsClient {
  private client: DodoPayments;
  private returnUrl: string;

  constructor(config: DodoPaymentsConfig) {
    this.client = new DodoPayments({
      bearerToken: config.bearerToken,
      environment: config.environment,
    });
    this.returnUrl = config.returnUrl;
  }

  async createCheckoutSession(data: CheckoutSessionData): Promise<PaymentResponse> {
    try {
      const session = await this.client.checkoutSessions.create({
        product_cart: data.product_cart,
        return_url: data.return_url || this.returnUrl,
        customer: data.customer ? {
          email: data.customer.email,
          name: data.customer.name,
          phone_number: data.customer.phone_number,
        } : undefined,
        billing_address: data.billing_address ? {
          city: data.billing_address.city,
          country: data.billing_address.country as "US" | "AF" | "AL" | "DZ",
          state: data.billing_address.state,
          street: data.billing_address.street,
          zipcode: data.billing_address.zipcode,
        } : undefined,
        metadata: data.metadata,
      });

      return {
        checkout_url: session.checkout_url || '',
        session_id: session.session_id || '',
      };
    } catch (error) {
      console.error('Dodo Payments checkout session error:', error);
      throw error;
    }
  }

  async createPaymentLink(data: Omit<CheckoutSessionData, 'product_cart'> & {
    product_id: string;
    quantity?: number;
  }): Promise<PaymentResponse> {
    try {
      const payment = await this.client.payments.create({
        billing: {
          city: data.billing_address?.city || 'San Francisco',
          country: (data.billing_address?.country || 'US') as "US" | "AF" | "AL" | "DZ",
          state: data.billing_address?.state || 'CA',
          street: data.billing_address?.street || '123 Main St',
          zipcode: data.billing_address?.zipcode || '94102',
        },
        customer: {
          email: data.customer.email,
          name: data.customer.name,
          phone_number: data.customer.phone_number,
        },
        product_cart: [{
          product_id: data.product_id,
          quantity: data.quantity || 1,
        }],
        payment_link: true,
        return_url: data.return_url || this.returnUrl,
        metadata: data.metadata,
      });

      return {
        checkout_url: payment.payment_link || '',
        session_id: payment.payment_id || '',
        payment_id: payment.payment_id,
      };
    } catch (error) {
      console.error('Dodo Payments payment link error:', error);
      throw error;
    }
  }
}

// Luceta Audio Platform Products (Subscription Products)
export const LUCETA_PRODUCTS: AudioProduct[] = [
  {
    id: 'pdt_0NV1JDzkDFrj9uiSzxHrl',
    name: 'Starter',
    description: 'Perfect for indie game developers getting started with audio',
    price: 29,
    category: 'starter',
    features: [
      'Audio cursor integration',
      'Up to 50 audio experiences/month',
      'Basic game engine support',
      'Community support',
      'One-click global deployment',
      'Game engine integration',
    ],
  },
  {
    id: 'pdt_0NV1JE2C5LsZ3WDz9uY2L',
    name: 'Pro',
    description: 'Advanced features for professional game studios',
    price: 99,
    category: 'pro',
    features: [
      'Advanced gesture recognition',
      'Up to 1,000 audio experiences/month',
      'Multi-platform deployment',
      'Priority support',
      'One-click global deployment',
      'Game engine integration',
    ],
  },
  {
    id: 'pdt_0NV1JE4U7U5uzVjPa0DzK',
    name: 'Enterprise',
    description: 'Full-scale solution for large game development teams',
    price: 299,
    category: 'enterprise',
    features: [
      'Custom audio templates',
      'Unlimited audio experiences',
      'Dedicated audio engineering support',
      '24/7 technical assistance',
      'One-click global deployment',
      'Game engine integration',
    ],
  },
];

export function getProductById(id: string): AudioProduct | undefined {
  return LUCETA_PRODUCTS.find(product => product.id === id);
}

export function getProductsByCategory(category: string): AudioProduct[] {
  return LUCETA_PRODUCTS.filter(product => product.category === category);
}
