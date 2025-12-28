/**
 * Luceta Chaos Mode
 * Injected by Requestly to test error handling resilience
 * 
 * Features:
 * - Random payment failures (configurable rate)
 * - Network timeout simulation
 * - Visual chaos indicator
 * - Detailed error logging
 */

(function() {
  'use strict';
  
  // Configuration
  const CHAOS_CONFIG = {
    failureRate: 0.3,        // 30% of requests fail
    timeoutRate: 0.1,        // 10% of requests timeout
    timeoutDuration: 10000,  // 10 second timeout
    enabled: true
  };
  
  // Prevent double injection
  if (window.__REQUESTLY_CHAOS_MODE__) {
    return;
  }
  window.__REQUESTLY_CHAOS_MODE__ = true;
  
  // Create chaos indicator
  const indicator = document.createElement('div');
  indicator.id = 'requestly-chaos-indicator';
  indicator.innerHTML = `
    <style>
      #requestly-chaos-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .chaos-badge {
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: chaos-pulse 2s infinite;
      }
      
      @keyframes chaos-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .chaos-icon {
        font-size: 18px;
        animation: chaos-shake 0.5s infinite;
      }
      
      @keyframes chaos-shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
      }
      
      .chaos-stats {
        font-size: 11px;
        opacity: 0.9;
        margin-top: 4px;
      }
    </style>
    
    <div class="chaos-badge">
      <span class="chaos-icon">💥</span>
      <div>
        <div>CHAOS MODE ACTIVE</div>
        <div class="chaos-stats">
          Failures: <span id="chaos-fail-count">0</span> | 
          Timeouts: <span id="chaos-timeout-count">0</span>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(indicator);
  
  // Stats tracking
  let failCount = 0;
  let timeoutCount = 0;
  
  // Error responses
  const errorResponses = [
    {
      status: 500,
      body: {
        success: false,
        error: 'Internal Server Error',
        error_code: 'CHAOS_INTERNAL_ERROR',
        message: 'The payment service encountered an unexpected error.'
      }
    },
    {
      status: 503,
      body: {
        success: false,
        error: 'Service Unavailable',
        error_code: 'CHAOS_SERVICE_DOWN',
        message: 'Payment gateway is temporarily unavailable. Please try again.'
      }
    },
    {
      status: 429,
      body: {
        success: false,
        error: 'Too Many Requests',
        error_code: 'CHAOS_RATE_LIMIT',
        message: 'You have exceeded the rate limit. Please wait before retrying.',
        retry_after: 30
      }
    },
    {
      status: 402,
      body: {
        success: false,
        error: 'Payment Required',
        error_code: 'CHAOS_PAYMENT_FAILED',
        message: 'The payment was declined. Please check your payment details.'
      }
    }
  ];
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    
    // Only apply chaos to checkout endpoints
    if (typeof url === 'string' && url.includes('/api/checkout')) {
      
      // Random timeout
      if (Math.random() < CHAOS_CONFIG.timeoutRate) {
        timeoutCount++;
        document.getElementById('chaos-timeout-count').textContent = timeoutCount;
        
        console.log('%c[Chaos Mode]', 'color: #dc2626; font-weight: bold;', 
          '⏱️ Simulating timeout...', { url });
        
        await new Promise(resolve => setTimeout(resolve, CHAOS_CONFIG.timeoutDuration));
        throw new Error('CHAOS_MODE: Network timeout simulated');
      }
      
      // Random failure
      if (Math.random() < CHAOS_CONFIG.failureRate) {
        failCount++;
        document.getElementById('chaos-fail-count').textContent = failCount;
        
        const errorResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
        
        console.log('%c[Chaos Mode]', 'color: #dc2626; font-weight: bold;', 
          '💥 Injecting failure:', errorResponse.body.error_code, { url });
        
        return new Response(JSON.stringify(errorResponse.body), {
          status: errorResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('%c[Chaos Mode]', 'color: #dc2626; font-weight: bold;', 
    `Activated! Failure rate: ${CHAOS_CONFIG.failureRate * 100}%, Timeout rate: ${CHAOS_CONFIG.timeoutRate * 100}%`);
})();
