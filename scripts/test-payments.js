#!/usr/bin/env node

/**
 * Payment Integration Test Script for Luceta Dodo Payments
 * 
 * This script tests:
 * 1. Dodo Payments API connectivity
 * 2. Checkout session creation
 * 3. Payment link generation
 * 4. Product configuration
 */

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';

// Test customer data
const testCustomer = {
  email: 'test@luceta.audio',
  name: 'Test User',
  phone_number: '+1234567890'
};

const testBillingAddress = {
  street: '123 Audio Street',
  city: 'San Francisco',
  state: 'CA',
  country: 'US',
  zipcode: '94102'
};

// Test checkout session creation
async function testCheckoutSession(productId = 'luceta_pro') {
  console.log(`🛒 Testing checkout session creation for ${productId}...`);
  
  const checkoutData = {
    product_id: productId,
    customer: testCustomer,
    billing_address: testBillingAddress,
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
      console.log(`   Checkout URL: ${data.checkout_url}`);
      console.log(`   Product: ${data.product.name} ($${data.product.price})`);
      return { success: true, data };
    } else {
      console.log('❌ Checkout session creation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data.error || data);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Failed to create checkout session');
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test quick checkout link generation
async function testQuickCheckout(productId = 'luceta_starter') {
  console.log(`\n🔗 Testing quick checkout link for ${productId}...`);
  
  const params = new URLSearchParams({
    product_id: productId,
    email: testCustomer.email,
    name: testCustomer.name
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout?${params}`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Quick checkout link generated successfully');
      console.log(`   Payment ID: ${data.payment_id}`);
      console.log(`   Checkout URL: ${data.checkout_url}`);
      console.log(`   Product: ${data.product.name} ($${data.product.price})`);
      return { success: true, data };
    } else {
      console.log('❌ Quick checkout link generation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data.error || data);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Failed to generate quick checkout link');
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Dodo Payments API connectivity
async function testDodoAPIConnectivity() {
  console.log('\n🌐 Testing Dodo Payments API connectivity...');
  
  if (!DODO_API_KEY) {
    console.log('❌ DODO_PAYMENTS_API_KEY not configured');
    return { success: false, error: 'API key missing' };
  }
  
  const baseUrl = DODO_ENVIRONMENT === 'test_mode' 
    ? 'https://test.dodopayments.com' 
    : 'https://api.dodopayments.com';
  
  try {
    // Test API connectivity with a simple request
    const response = await fetch(`${baseUrl}/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Dodo Payments API is accessible');
      console.log(`   Environment: ${DODO_ENVIRONMENT}`);
      console.log(`   Base URL: ${baseUrl}`);
      return { success: true };
    } else {
      console.log('❌ Dodo Payments API connectivity failed');
      console.log(`   Status: ${response.status}`);
      const errorData = await response.json().catch(() => null);
      console.log(`   Error:`, errorData);
      return { success: false, error: `API returned ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Failed to connect to Dodo Payments API');
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test all Luceta products
async function testAllProducts() {
  console.log('\n🎵 Testing all Luceta audio products...');
  
  const products = ['luceta_starter', 'luceta_pro', 'luceta_enterprise'];
  const results = [];
  
  for (const productId of products) {
    console.log(`\n--- Testing ${productId} ---`);
    const result = await testCheckoutSession(productId);
    results.push({ productId, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Test environment configuration
function testEnvironmentConfig() {
  console.log('⚙️  Testing environment configuration...');
  
  const requiredVars = [
    'DODO_PAYMENTS_API_KEY',
    'NEXT_PUBLIC_BASE_URL'
  ];
  
  const optionalVars = [
    'DODO_PAYMENTS_ENVIRONMENT',
    'DODO_WEBHOOK_SECRET',
    'NEXT_PUBLIC_RETURN_URL'
  ];
  
  let configValid = true;
  
  console.log('\n   Required variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      configValid = false;
    }
  }
  
  console.log('\n   Optional variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value}`);
    } else {
      console.log(`   ⚠️  ${varName}: not set (using default)`);
    }
  }
  
  return configValid;
}

// Main test function
async function runPaymentTests() {
  console.log('🚀 Starting Luceta Payment Integration Tests\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Environment configuration
  totalTests++;
  if (testEnvironmentConfig()) {
    passedTests++;
  }
  
  // Test 2: Dodo API connectivity
  totalTests++;
  const apiTest = await testDodoAPIConnectivity();
  if (apiTest.success) {
    passedTests++;
  }
  
  // Test 3: Checkout session creation
  totalTests++;
  const checkoutTest = await testCheckoutSession();
  if (checkoutTest.success) {
    passedTests++;
  }
  
  // Test 4: Quick checkout link
  totalTests++;
  const quickTest = await testQuickCheckout();
  if (quickTest.success) {
    passedTests++;
  }
  
  // Results
  console.log('\n📊 Payment Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All payment tests passed! Your Dodo Payments integration is working correctly.');
    
    // Show sample checkout URLs for manual testing
    if (checkoutTest.success) {
      console.log('\n🔗 Sample checkout URL for manual testing:');
      console.log(`   ${checkoutTest.data.checkout_url}`);
    }
  } else {
    console.log('⚠️  Some tests failed. Check your Dodo Payments configuration.');
  }
  
  return passedTests === totalTests;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPaymentTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { runPaymentTests, testCheckoutSession, testQuickCheckout, testDodoAPIConnectivity };