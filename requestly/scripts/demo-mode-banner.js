/**
 * Luceta Demo Mode Banner
 * Injected by Requestly to indicate payment simulation mode
 * 
 * Features:
 * - Fixed banner at top of page
 * - Shows demo mode status
 * - Includes dismiss button
 * - Logs all checkout attempts to console
 */

(function() {
  'use strict';
  
  // Prevent double injection
  if (document.getElementById('requestly-luceta-demo-banner')) {
    return;
  }

  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'requestly-luceta-demo-banner';
  banner.innerHTML = `
    <style>
      #requestly-luceta-demo-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .requestly-banner-content {
        background: linear-gradient(135deg, #156d95 0%, #1e7ba8 50%, #2589bd 100%);
        color: white;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        box-shadow: 0 2px 12px rgba(21, 109, 149, 0.3);
      }
      
      .requestly-banner-icon {
        font-size: 20px;
      }
      
      .requestly-banner-text {
        font-size: 14px;
        font-weight: 500;
      }
      
      .requestly-banner-badge {
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .requestly-banner-dismiss {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .requestly-banner-dismiss:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .requestly-banner-stats {
        font-size: 12px;
        opacity: 0.9;
      }
    </style>
    
    <div class="requestly-banner-content">
      <span class="requestly-banner-icon">🎵</span>
      <span class="requestly-banner-text">
        <strong>LUCETA DEMO MODE</strong> — Payments are simulated via Requestly
      </span>
      <span class="requestly-banner-badge">No Real Charges</span>
      <span class="requestly-banner-stats" id="requestly-checkout-count">
        Checkouts: 0
      </span>
      <button class="requestly-banner-dismiss" onclick="this.parentElement.parentElement.style.display='none'; document.body.style.paddingTop='0';">
        Dismiss
      </button>
    </div>
  `;
  
  document.body.prepend(banner);
  document.body.style.paddingTop = '48px';
  
  // Track checkout attempts
  let checkoutCount = 0;
  
  // Intercept fetch to count checkout calls
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('/api/checkout')) {
      checkoutCount++;
      document.getElementById('requestly-checkout-count').textContent = `Checkouts: ${checkoutCount}`;
      
      console.log('%c[Requestly Demo Mode]', 'color: #156d95; font-weight: bold;', 
        `Checkout attempt #${checkoutCount}`, {
          url: url,
          timestamp: new Date().toISOString(),
          mocked: true
        }
      );
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('%c[Requestly]', 'color: #156d95; font-weight: bold;', 
    'Demo Mode Banner injected successfully. All payments will be simulated.');
})();
