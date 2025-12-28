#!/usr/bin/env node

/**
 * Frontend Integration Test for Luceta Dodo Payments
 * Tests the complete frontend flow including pricing section and checkout
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
  } catch (error) {
    console.log('⚠️  Could not load .env file:', error.message);
  }
}

loadEnvFile();

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test data for all three products
const testProducts = [
  {
    id: 'pdt_0NV05r1az5RQRr1hkm43c',
    name: 'Starter',
    price: 29
  },
  {
    id: 'pdt_0NV05rFxgWtor793xLtta',
    name: 'Pro',
    price: 99
  },
  {
    id: 'pdt_0NV05rVPbCml7XEvuLW9R',
    name: 'Enterprise',
    price: 299
  }
];

// Test customer data
const testCustomer = {
  email: 'test@luceta.audio',
  name: 'Test User',
  phone_number: '+12345678901' // Fixed: proper US phone format
};

const testBillingAddress = {
  street: '123 Audio Street',
  city: 'San Francisco',
  state: 'CA',
  country: 'US',
  zipcode: '94102'
};

// Test frontend homepage
async function testHomepage() {
  console.log('\n🏠 Testing homepage...');
  
  try {
    const response = await fetch(`${API_BASE_URL}`, { method: 'GET' });
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for Luceta branding
      const hasLuceta = html.includes('Luceta') || html.includes('luceta');
      const hasAudio = html.includes('audio') || html.includes('Audio');
      const hasGameDev = html.includes('game') || html.includes('Game');
      
      console.log('✅ Homepage loaded successfully');
      console.log(`   Luceta branding: ${hasLuceta ? '✅' : '❌'}`);
      console.log(`   Audio content: ${hasAudio ? '✅' : '❌'}`);
      console.log(`   Game dev content: ${hasGameDev ? '✅' : '❌'}`);
      
      return hasLuceta && hasAudio;
    } else {
      console.log('❌ Homepage failed to load');
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to reach homepage');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test checkout API for each product
async function testCheckoutForProduct(product, planType = 'monthly') {
  console.log(`\n🛒 Testing checkout for ${product.name} (${planType})...`);
  
  const checkoutData = {
    product_id: product.id,
    customer: testCustomer,
    billing_address: testBillingAddress,
    quantity: 1,
    plan_type: planType
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
      console.log(`   Product: ${data.product.name} ($${data.product.price})`);
      console.log(`   Session ID: ${data.session_id}`);
      console.log(`   Checkout URL: ${data.checkout_url}`);
      
      // Verify the checkout URL is valid
      const isValidUrl = data.checkout_url && data.checkout_url.startsWith('https://');
      console.log(`   Valid checkout URL: ${isValidUrl ? '✅' : '❌'}`);
      
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

// Test quick checkout GET endpoint
async function testQuickCheckout(product) {
  console.log(`\n🔗 Testing quick checkout for ${product.name}...`);
  
  const params = new URLSearchParams({
    product_id: product.id,
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
      console.log(`   Product: ${data.product.name} ($${data.product.price})`);
      console.log(`   Payment ID: ${data.payment_id}`);
      console.log(`   Checkout URL: ${data.checkout_url}`);
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

// Test pricing page (if it exists as a separate route)
async function testPricingPage() {
  console.log('\n💰 Testing pricing section...');
  
  try {
    // Test if pricing is embedded in homepage or separate page
    const response = await fetch(`${API_BASE_URL}`, { method: 'GET' });
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for pricing content
      const hasPricing = html.includes('Choose Your Plan') || html.includes('pricing') || html.includes('Pricing');
      const hasStarter = html.includes('Starter');
      const hasPro = html.includes('Pro');
      const hasEnterprise = html.includes('Enterprise');
      
      console.log('✅ Pricing section analysis:');
      console.log(`   Pricing content: ${hasPricing ? '✅' : '❌'}`);
      console.log(`   Starter plan: ${hasStarter ? '✅' : '❌'}`);
      console.log(`   Pro plan: ${hasPro ? '✅' : '❌'}`);
      console.log(`   Enterprise plan: ${hasEnterprise ? '✅' : '❌'}`);
      
      return hasPricing && hasStarter && hasPro && hasEnterprise;
    } else {
      console.log('❌ Failed to load pricing content');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to test pricing section');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runFrontendTests() {
  console.log('🎵 Luceta Frontend Integration Tests');
  console.log('='.repeat(50));
  console.log(`Testing frontend at: ${API_BASE_URL}\n`);
  
  let passed = 0;
  let total = 0;
  const results = [];
  
  // Test 1: Homepage
  total++;
  const homepageResult = await testHomepage();
  if (homepageResult) passed++;
  results.push({ test: 'Homepage', passed: homepageResult });
  
  // Test 2: Pricing section
  total++;
  const pricingResult = await testPricingPage();
  if (pricingResult) passed++;
  results.push({ test: 'Pricing Section', passed: pricingResult });
  
  // Test 3-5: Checkout for each product (monthly)
  for (const product of testProducts) {
    total++;
    const checkoutResult = await testCheckoutForProduct(product, 'monthly');
    if (checkoutResult.success) passed++;
    results.push({ test: `${product.name} Checkout (Monthly)`, passed: checkoutResult.success });
  }
  
  // Test 6-8: Quick checkout for each product
  for (const product of testProducts) {
    total++;
    const quickResult = await testQuickCheckout(product);
    if (quickResult.success) passed++;
    results.push({ test: `${product.name} Quick Checkout`, passed: quickResult.success });
  }
  
  // Test 9-11: Yearly checkout for each product
  for (const product of testProducts) {
    total++;
    const yearlyResult = await testCheckoutForProduct(product, 'yearly');
    if (yearlyResult.success) passed++;
    results.push({ test: `${product.name} Checkout (Yearly)`, passed: yearlyResult.success });
  }
  
  // Results summary
  console.log('\n📊 Frontend Test Results:');
  console.log('='.repeat(30));
  results.forEach(result => {
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.test}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL FRONTEND TESTS PASSED!');
    console.log('Your Luceta frontend integration is working perfectly.');
    console.log('\n🚀 Ready for production:');
    console.log('1. ✅ Homepage loads with Luceta branding');
    console.log('2. ✅ Pricing section displays all plans');
    console.log('3. ✅ Checkout API works for all products');
    console.log('4. ✅ Quick checkout links work');
    console.log('5. ✅ Both monthly and yearly billing work');
    
    console.log('\n🔗 Sample checkout URLs for manual testing:');
    // Show one sample URL from the tests
    if (results.some(r => r.passed)) {
      console.log('Visit any of the checkout URLs above to test the complete payment flow!');
    }
  } else {
    console.log('\n⚠️  SOME FRONTEND TESTS FAILED');
    console.log('Please check the error messages above and fix the issues.');
    console.log('\nCommon issues:');
    console.log('- Next.js server not running (npm run dev)');
    console.log('- Environment variables not loaded');
    console.log('- Product IDs mismatch');
    console.log('- API routes not working');
  }
  
  return passed === total;
}

// Run tests
runFrontendTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Frontend test runner error:', error);
    process.exit(1);
  });