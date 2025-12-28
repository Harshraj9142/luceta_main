#!/usr/bin/env node

/**
 * Webhook Test Script for Luceta Dodo Payments Integration
 * 
 * This script tests:
 * 1. Webhook endpoint health
 * 2. Webhook signature verification
 * 3. Sample webhook event processing
 */

import crypto from 'crypto';

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/dodo';
const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || 'your_webhook_secret_here';

// Sample webhook events for testing
const sampleEvents = {
  paymentCompleted: {
    id: 'evt_test_payment_completed',
    type: 'payment.completed',
    data: {
      payment_id: 'pay_test_123456',
      customer_id: 'cus_test_789012',
      amount: 9900, // $99.00 in cents
      currency: 'USD',
      status: 'completed',
      metadata: {
        platform: 'luceta-audio',
        source: 'pricing_page',
        plan_type: 'monthly',
        product_name: 'Pro',
        product_category: 'pro'
      }
    },
    created_at: new Date().toISOString()
  },
  
  subscriptionCreated: {
    id: 'evt_test_subscription_created',
    type: 'subscription.created',
    data: {
      subscription_id: 'sub_test_345678',
      customer_id: 'cus_test_789012',
      status: 'active',
      metadata: {
        platform: 'luceta-audio',
        product_name: 'Pro',
        product_category: 'pro'
      }
    },
    created_at: new Date().toISOString()
  },
  
  paymentFailed: {
    id: 'evt_test_payment_failed',
    type: 'payment.failed',
    data: {
      payment_id: 'pay_test_failed_123',
      customer_id: 'cus_test_789012',
      amount: 2900,
      currency: 'USD',
      status: 'failed',
      metadata: {
        platform: 'luceta-audio',
        product_name: 'Starter'
      }
    },
    created_at: new Date().toISOString()
  }
};

// Generate webhook signature (placeholder - implement based on Dodo Payments docs)
function generateSignature(payload, secret) {
  // This is a placeholder implementation
  // Replace with actual Dodo Payments signature generation
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Test webhook endpoint health
async function testWebhookHealth() {
  console.log('🏥 Testing webhook health...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      console.log('✅ Webhook endpoint is healthy');
      console.log(`   Service: ${data.service}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.log('❌ Webhook endpoint health check failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to reach webhook endpoint');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test webhook event processing
async function testWebhookEvent(eventName, eventData) {
  console.log(`\n🧪 Testing ${eventName} event...`);
  
  const payload = JSON.stringify(eventData);
  const signature = generateSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dodo-signature': signature
      },
      body: payload
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Webhook event processed successfully');
      console.log(`   Event ID: ${data.event_id}`);
      console.log(`   Event Type: ${data.event_type}`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log('❌ Webhook event processing failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to send webhook event');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runWebhookTests() {
  console.log('🚀 Starting Luceta Webhook Tests\n');
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Webhook Secret: ${WEBHOOK_SECRET ? '***configured***' : '❌ NOT SET'}\n`);
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health check
  totalTests++;
  if (await testWebhookHealth()) {
    passedTests++;
  }
  
  // Test 2: Payment completed event
  totalTests++;
  if (await testWebhookEvent('payment.completed', sampleEvents.paymentCompleted)) {
    passedTests++;
  }
  
  // Test 3: Subscription created event
  totalTests++;
  if (await testWebhookEvent('subscription.created', sampleEvents.subscriptionCreated)) {
    passedTests++;
  }
  
  // Test 4: Payment failed event
  totalTests++;
  if (await testWebhookEvent('payment.failed', sampleEvents.paymentFailed)) {
    passedTests++;
  }
  
  // Results
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All webhook tests passed! Your integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check your webhook implementation.');
  }
  
  return passedTests === totalTests;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWebhookTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { runWebhookTests, testWebhookHealth, testWebhookEvent };