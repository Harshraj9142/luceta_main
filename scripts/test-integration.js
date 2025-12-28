#!/usr/bin/env node

/**
 * Simple Integration Test for Luceta Dodo Payments
 * Tests webhook and payment functionality
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
    
    console.log('✅ Loaded environment variables from .env file');
  } catch (error) {
    console.log('⚠️  Could not load .env file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

// Test configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/dodo';
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

console.log('🎵 Luceta Audio Platform - Integration Test');
console.log('='.repeat(50));

// Test 1: Webhook Health Check
async function testWebhookHealth() {
  console.log('\n🏥 Testing webhook endpoint...');
  
  try {
    const response = await fetch(WEBHOOK_URL, { method: 'GET' });
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      console.log('✅ Webhook endpoint is healthy');
      console.log(`   Service: ${data.service}`);
      return true;
    } else {
      console.log('❌ Webhook endpoint failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach webhook endpoint');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 2: Sample Webhook Event
async function testWebhookEvent() {
  console.log('\n🧪 Testing webhook event processing...');
  
  const sampleEvent = {
    id: 'evt_test_123',
    type: 'payment.completed',
    data: {
      payment_id: 'pay_test_456',
      customer_id: 'cus_test_789',
      amount: 9900,
      currency: 'USD',
      status: 'completed',
      metadata: {
        platform: 'luceta-audio',
        product_name: 'Pro',
        plan_type: 'monthly'
      }
    },
    created_at: new Date().toISOString()
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dodo-signature': 'test_signature'
      },
      body: JSON.stringify(sampleEvent)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Webhook event processed successfully');
      console.log(`   Event ID: ${data.event_id}`);
      console.log(`   Event Type: ${data.event_type}`);
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

// Test 3: Checkout API
async function testCheckoutAPI() {
  console.log('\n🛒 Testing checkout API...');
  
  const checkoutData = {
    product_id: 'pdt_0NV05rFxgWtor793xLtta', // Use actual Pro product ID
    customer: {
      email: 'test@luceta.audio',
      name: 'Test User'
    },
    quantity: 1,
    plan_type: 'monthly'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Checkout session created successfully');
      console.log(`   Session ID: ${data.session_id}`);
      console.log(`   Product: ${data.product.name} ($${data.product.price})`);
      console.log(`   Checkout URL: ${data.checkout_url}`);
      return true;
    } else {
      console.log('❌ Checkout session creation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data.error || data);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to create checkout session');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 4: Environment Check
function testEnvironment() {
  console.log('\n⚙️  Checking environment configuration...');
  
  const requiredVars = [
    'DODO_PAYMENTS_API_KEY',
    'NEXT_PUBLIC_BASE_URL'
  ];
  
  let allSet = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: configured`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      allSet = false;
    }
  }
  
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (webhookSecret) {
    console.log(`   ✅ DODO_WEBHOOK_SECRET: configured`);
  } else {
    console.log(`   ⚠️  DODO_WEBHOOK_SECRET: not set (webhook signature verification disabled)`);
  }
  
  return allSet;
}

// Main test runner
async function runTests() {
  let passed = 0;
  let total = 0;
  
  // Test environment
  total++;
  if (testEnvironment()) passed++;
  
  // Test webhook health
  total++;
  if (await testWebhookHealth()) passed++;
  
  // Test webhook event
  total++;
  if (await testWebhookEvent()) passed++;
  
  // Test checkout API
  total++;
  if (await testCheckoutAPI()) passed++;
  
  // Results
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Your Luceta Dodo Payments integration is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Set up ngrok for webhook testing');
    console.log('2. Configure webhook URL in Dodo Payments dashboard');
    console.log('3. Test real payments in test mode');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please check the error messages above.');
    console.log('\nCommon fixes:');
    console.log('- Create .env.local with your Dodo Payments API key');
    console.log('- Make sure your Next.js server is running (npm run dev)');
    console.log('- Check your Dodo Payments dashboard configuration');
  }
  
  return passed === total;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
  });