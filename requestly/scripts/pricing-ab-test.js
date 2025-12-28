/**
 * Luceta Pricing A/B Test Injector
 * Injected by Requestly to test different pricing strategies
 * 
 * Features:
 * - Dynamic price modification
 * - Discount badge injection
 * - Urgency timer injection
 * - Conversion tracking
 */

(function() {
  'use strict';
  
  // Prevent double injection
  if (window.__REQUESTLY_AB_TEST__) {
    return;
  }
  window.__REQUESTLY_AB_TEST__ = true;
  
  // A/B Test Configuration
  const AB_CONFIG = {
    variant: 'discount', // 'control', 'discount', 'urgency', 'social_proof'
    discountPercent: 20,
    urgencyMinutes: 47,
    socialProofCount: 127
  };
  
  // Wait for DOM to be ready
  const waitForElement = (selector, callback, maxAttempts = 50) => {
    let attempts = 0;
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element || attempts >= maxAttempts) {
        clearInterval(interval);
        if (element) callback(element);
      }
      attempts++;
    }, 100);
  };
  
  // Inject discount badges
  const injectDiscountBadges = () => {
    waitForElement('[class*="pricing"], [class*="Pricing"]', (pricingSection) => {
      // Find all price elements
      const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"]');
      
      priceElements.forEach(el => {
        if (el.querySelector('.requestly-discount-badge')) return;
        
        const badge = document.createElement('span');
        badge.className = 'requestly-discount-badge';
        badge.innerHTML = `
          <style>
            .requestly-discount-badge {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              margin-left: 8px;
              animation: badge-bounce 1s ease-in-out infinite;
            }
            @keyframes badge-bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
          </style>
          ${AB_CONFIG.discountPercent}% OFF
        `;
        el.appendChild(badge);
      });
      
      console.log('%c[A/B Test]', 'color: #10b981; font-weight: bold;', 
        `Discount badges injected (${AB_CONFIG.discountPercent}% off)`);
    });
  };
  
  // Inject urgency timer
  const injectUrgencyTimer = () => {
    waitForElement('[class*="pricing"], [class*="Pricing"]', (pricingSection) => {
      if (document.getElementById('requestly-urgency-timer')) return;
      
      let minutes = AB_CONFIG.urgencyMinutes;
      let seconds = 0;
      
      const timer = document.createElement('div');
      timer.id = 'requestly-urgency-timer';
      timer.innerHTML = `
        <style>
          #requestly-urgency-timer {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            text-align: center;
            margin: 20px auto;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
          }
          .urgency-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .urgency-countdown {
            font-size: 32px;
            font-weight: 700;
            font-family: monospace;
          }
          .urgency-subtitle {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 8px;
          }
        </style>
        <div class="urgency-title">⚡ Limited Time Offer</div>
        <div class="urgency-countdown" id="urgency-countdown">
          ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
        </div>
        <div class="urgency-subtitle">Offer expires soon - Don't miss out!</div>
      `;
      
      pricingSection.prepend(timer);
      
      // Countdown logic
      const countdownEl = document.getElementById('urgency-countdown');
      setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) return;
          minutes--;
          seconds = 59;
        } else {
          seconds--;
        }
        countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }, 1000);
      
      console.log('%c[A/B Test]', 'color: #f59e0b; font-weight: bold;', 
        `Urgency timer injected (${AB_CONFIG.urgencyMinutes} minutes)`);
    });
  };
  
  // Inject social proof
  const injectSocialProof = () => {
    waitForElement('[class*="pricing"], [class*="Pricing"]', (pricingSection) => {
      if (document.getElementById('requestly-social-proof')) return;
      
      const proof = document.createElement('div');
      proof.id = 'requestly-social-proof';
      proof.innerHTML = `
        <style>
          #requestly-social-proof {
            background: rgba(21, 109, 149, 0.1);
            border: 1px solid rgba(21, 109, 149, 0.2);
            padding: 12px 20px;
            border-radius: 10px;
            text-align: center;
            margin: 16px auto;
            max-width: 350px;
            font-size: 14px;
            color: #156d95;
          }
          .social-proof-icon {
            margin-right: 8px;
          }
          .social-proof-count {
            font-weight: 700;
          }
        </style>
        <span class="social-proof-icon">👥</span>
        <span class="social-proof-count">${AB_CONFIG.socialProofCount}</span> developers 
        purchased this plan today
      `;
      
      pricingSection.prepend(proof);
      
      console.log('%c[A/B Test]', 'color: #156d95; font-weight: bold;', 
        `Social proof injected (${AB_CONFIG.socialProofCount} purchases)`);
    });
  };
  
  // Apply variant
  switch (AB_CONFIG.variant) {
    case 'discount':
      injectDiscountBadges();
      break;
    case 'urgency':
      injectUrgencyTimer();
      break;
    case 'social_proof':
      injectSocialProof();
      break;
    case 'all':
      injectDiscountBadges();
      injectUrgencyTimer();
      injectSocialProof();
      break;
  }
  
  console.log('%c[A/B Test]', 'color: #8b5cf6; font-weight: bold;', 
    `Variant "${AB_CONFIG.variant}" activated`);
})();
