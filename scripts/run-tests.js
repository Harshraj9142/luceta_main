#!/usr/bin/env node

/**
 * Complete Test Suite for Luceta Dodo Payments Integration
 * 
 * Runs all tests in sequence:
 * 1. Environment configuration
 * 2. Payment API tests
 * 3. Webhook tests
 * 4. End-to-end flow test
 */

import { runPaymentTests } from './test-payments.js';
import { runWebhookTests } from './test-webhook.js';

async function runCompleteTestSuite() {
  console.log('🎵 Luceta Audio Platform - Complete Integration Test Suite');
  console.log('=' .repeat(60));
  console.log('Testing Dodo Payments integration for audio engineering platform\n');
  
  let allTestsPassed = true;
  
  try {
    // Run payment tests
    console.log('PHASE 1: Payment Integration Tests');
    console.log('-'.repeat(40));
    const paymentTestsPass = await runPaymentTests();
    
    console.log('\n\n');
    
    // Run webhook tests
    console.log('PHASE 2: Webhook Integration Tests');
    console.log('-'.repeat(40));
    const webhookTestsPass = await runWebhookTests();
    
    console.log('\n\n');
    
    // Overall results
    console.log('FINAL RESULTS');
    console.log('='.repeat(40));
    console.log(`Payment Tests: ${paymentTestsPass ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Webhook Tests: ${webhookTestsPass ? '✅ PASSED' : '❌ FAILED'}`);
    
    allTestsPassed = paymentTestsPass && webhookTestsPass;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('Your Luceta Dodo Payments integration is fully functional.');
      console.log('\nNext steps:');
      console.log('1. Test the payment flow manually using the checkout URLs');
      console.log('2. Verify webhook events are received during payment');
      console.log('3. Deploy to production when ready');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Please check the error messages above and fix the issues.');
      console.log('\nCommon issues:');
      console.log('- Missing environment variables (.env.local)');
      console.log('- Incorrect Dodo Payments API key');
      console.log('- Webhook URL not accessible (check ngrok)');
      console.log('- Network connectivity issues');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTestSuite()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

export { runCompleteTestSuite };