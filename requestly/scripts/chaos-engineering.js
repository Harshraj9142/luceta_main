/**
 * LUCETA CHAOS ENGINEERING MODE
 * =============================
 * Inject this script via Requestly "Insert Scripts" rule
 * URL Pattern: localhost:3000 OR your-domain.com
 * 
 * Features:
 * - Random failures (configurable %)
 * - Random delays
 * - Network throttling simulation
 * - Error injection
 */

(function() {
  'use strict';
  
  if (window.__LUCETA_CHAOS_INJECTED__) return;
  window.__LUCETA_CHAOS_INJECTED__ = true;

  // Chaos configuration
  const CHAOS_CONFIG = {
    enabled: true,
    failureRate: 0.2,        // 20% chance of failure
    minDelay: 500,           // Minimum delay in ms
    maxDelay: 3000,          // Maximum delay in ms
    delayProbability: 0.3,   // 30% chance of delay
    affectedEndpoints: [
      '/api/checkout',
      '/api/listings',
      '/api/upload'
    ]
  };

  // Create chaos control panel
  const panel = document.createElement('div');
  panel.id = 'luceta-chaos-panel';
  panel.innerHTML = `
    <style>
      #luceta-chaos-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .chaos-toggle {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .chaos-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
      }
      
      .chaos-toggle.inactive {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
      }
      
      .chaos-panel-expanded {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: none;
        min-width: 280px;
      }
      
      .chaos-panel-expanded.visible {
        display: block;
      }
      
      .chaos-title {
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 16px;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .chaos-slider-group {
        margin-bottom: 16px;
      }
      
      .chaos-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
      }
      
      .chaos-slider {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        -webkit-appearance: none;
        background: #e5e7eb;
      }
      
      .chaos-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ef4444;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      }
      
      .chaos-stats {
        background: #f3f4f6;
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        color: #4b5563;
      }
      
      .chaos-stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      .chaos-stat-value {
        font-weight: 600;
        color: #ef4444;
      }
    </style>
    
    <div class="chaos-panel-expanded" id="chaos-expanded">
      <div class="chaos-title">
        ⚡ Chaos Engineering
      </div>
      
      <div class="chaos-slider-group">
        <div class="chaos-label">
          <span>Failure Rate</span>
          <span id="failure-rate-value">20%</span>
        </div>
        <input type="range" class="chaos-slider" id="failure-rate" min="0" max="100" value="20">
      </div>
      
      <div class="chaos-slider-group">
        <div class="chaos-label">
          <span>Delay Probability</span>
          <span id="delay-prob-value">30%</span>
        </div>
        <input type="range" class="chaos-slider" id="delay-prob" min="0" max="100" value="30">
      </div>
      
      <div class="chaos-slider-group">
        <div class="chaos-label">
          <span>Max Delay (ms)</span>
          <span id="max-delay-value">3000ms</span>
        </div>
        <input type="range" class="chaos-slider" id="max-delay" min="500" max="10000" value="3000" step="500">
      </div>
      
      <div class="chaos-stats">
        <div class="chaos-stat-row">
          <span>Requests Intercepted:</span>
          <span class="chaos-stat-value" id="chaos-intercepted">0</span>
        </div>
        <div class="chaos-stat-row">
          <span>Failures Injected:</span>
          <span class="chaos-stat-value" id="chaos-failures">0</span>
        </div>
        <div class="chaos-stat-row">
          <span>Delays Added:</span>
          <span class="chaos-stat-value" id="chaos-delays">0</span>
        </div>
      </div>
    </div>
    
    <button class="chaos-toggle" id="chaos-toggle">
      <span>🔥</span>
      <span id="chaos-status">Chaos Mode: ON</span>
    </button>
  `;
  
  document.body.appendChild(panel);
  
  // Stats
  const chaosStats = {
    intercepted: 0,
    failures: 0,
    delays: 0
  };
  
  // UI Elements
  const toggleBtn = document.getElementById('chaos-toggle');
  const expandedPanel = document.getElementById('chaos-expanded');
  const failureSlider = document.getElementById('failure-rate');
  const delayProbSlider = document.getElementById('delay-prob');
  const maxDelaySlider = document.getElementById('max-delay');
  
  // Toggle panel
  toggleBtn.addEventListener('click', () => {
    expandedPanel.classList.toggle('visible');
  });
  
  // Update sliders
  failureSlider.addEventListener('input', (e) => {
    CHAOS_CONFIG.failureRate = e.target.value / 100;
    document.getElementById('failure-rate-value').textContent = e.target.value + '%';
  });
  
  delayProbSlider.addEventListener('input', (e) => {
    CHAOS_CONFIG.delayProbability = e.target.value / 100;
    document.getElementById('delay-prob-value').textContent = e.target.value + '%';
  });
  
  maxDelaySlider.addEventListener('input', (e) => {
    CHAOS_CONFIG.maxDelay = parseInt(e.target.value);
    document.getElementById('max-delay-value').textContent = e.target.value + 'ms';
  });
  
  function updateChaosStats() {
    document.getElementById('chaos-intercepted').textContent = chaosStats.intercepted;
    document.getElementById('chaos-failures').textContent = chaosStats.failures;
    document.getElementById('chaos-delays').textContent = chaosStats.delays;
  }
  
  // Intercept fetch with chaos
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    // Check if this endpoint should be affected
    const shouldAffect = CHAOS_CONFIG.affectedEndpoints.some(ep => url.includes(ep));
    
    if (!shouldAffect || !CHAOS_CONFIG.enabled) {
      return originalFetch.apply(this, args);
    }
    
    chaosStats.intercepted++;
    updateChaosStats();
    
    // Random failure
    if (Math.random() < CHAOS_CONFIG.failureRate) {
      chaosStats.failures++;
      updateChaosStats();
      
      console.log('%c[Chaos] Injecting failure for: ' + url, 'color: #ef4444; font-weight: bold;');
      
      throw new Error('Chaos Mode: Simulated network failure');
    }
    
    // Random delay
    if (Math.random() < CHAOS_CONFIG.delayProbability) {
      const delay = Math.floor(Math.random() * (CHAOS_CONFIG.maxDelay - CHAOS_CONFIG.minDelay)) + CHAOS_CONFIG.minDelay;
      chaosStats.delays++;
      updateChaosStats();
      
      console.log('%c[Chaos] Adding ' + delay + 'ms delay for: ' + url, 'color: #f59e0b; font-weight: bold;');
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('%c[Requestly] Chaos Engineering Mode Active', 
    'background: #ef4444; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
})();
