/**
 * LUCETA DEMO MODE BANNER
 * ========================
 * Inject this script via Requestly "Insert Scripts" rule
 * URL Pattern: localhost:3000 OR your-domain.com
 * 
 * Features:
 * - Shows demo mode banner at top
 * - Tracks API calls in real-time
 * - Shows mock/real status for each request
 */

(function() {
  'use strict';
  
  // Prevent double injection
  if (window.__LUCETA_DEMO_INJECTED__) return;
  window.__LUCETA_DEMO_INJECTED__ = true;

  // Stats tracking
  const stats = {
    checkoutCalls: 0,
    listingsCalls: 0,
    uploadCalls: 0,
    mockedRequests: 0,
    realRequests: 0
  };

  // Create banner
  const banner = document.createElement('div');
  banner.id = 'luceta-requestly-banner';
  banner.innerHTML = `
    <style>
      #luceta-requestly-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .luceta-banner-main {
        background: linear-gradient(135deg, #156d95 0%, #1e7ba8 50%, #2589bd 100%);
        color: white;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 20px rgba(21, 109, 149, 0.4);
      }
      
      .luceta-banner-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .luceta-banner-logo {
        font-size: 24px;
      }
      
      .luceta-banner-title {
        font-weight: 700;
        font-size: 16px;
        letter-spacing: 0.5px;
      }
      
      .luceta-banner-subtitle {
        font-size: 12px;
        opacity: 0.9;
      }
      
      .luceta-banner-stats {
        display: flex;
        gap: 16px;
        font-size: 12px;
      }
      
      .luceta-stat {
        background: rgba(255,255,255,0.15);
        padding: 6px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .luceta-stat-value {
        font-weight: 700;
        font-size: 14px;
      }
      
      .luceta-banner-badge {
        background: #10b981;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      .luceta-banner-dismiss {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .luceta-banner-dismiss:hover {
        background: rgba(255,255,255,0.3);
        transform: scale(1.05);
      }
      
      .luceta-activity-log {
        background: rgba(0,0,0,0.8);
        color: #10b981;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 11px;
        padding: 8px 24px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s;
      }
      
      .luceta-activity-log.expanded {
        max-height: 150px;
        overflow-y: auto;
      }
      
      .luceta-log-entry {
        padding: 2px 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .luceta-log-time {
        color: #6b7280;
        margin-right: 8px;
      }
      
      .luceta-log-mock {
        color: #f59e0b;
      }
      
      .luceta-log-real {
        color: #10b981;
      }
    </style>
    
    <div class="luceta-banner-main">
      <div class="luceta-banner-left">
        <span class="luceta-banner-logo">🎵</span>
        <div>
          <div class="luceta-banner-title">LUCETA DEMO MODE</div>
          <div class="luceta-banner-subtitle">Powered by Requestly • API Mocking Active</div>
        </div>
        <span class="luceta-banner-badge">HACKATHON</span>
      </div>
      
      <div class="luceta-banner-stats">
        <div class="luceta-stat">
          💳 Checkouts: <span class="luceta-stat-value" id="stat-checkout">0</span>
        </div>
        <div class="luceta-stat">
          🎨 NFT Calls: <span class="luceta-stat-value" id="stat-listings">0</span>
        </div>
        <div class="luceta-stat">
          📤 Uploads: <span class="luceta-stat-value" id="stat-upload">0</span>
        </div>
        <div class="luceta-stat">
          🎭 Mocked: <span class="luceta-stat-value" id="stat-mocked">0</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button class="luceta-banner-dismiss" id="toggle-log">Show Log</button>
        <button class="luceta-banner-dismiss" onclick="this.closest('#luceta-requestly-banner').style.display='none'; document.body.style.paddingTop='0';">
          ✕ Close
        </button>
      </div>
    </div>
    
    <div class="luceta-activity-log" id="activity-log"></div>
  `;
  
  document.body.prepend(banner);
  document.body.style.paddingTop = '60px';
  
  // Activity log
  const logContainer = document.getElementById('activity-log');
  const toggleBtn = document.getElementById('toggle-log');
  
  toggleBtn.addEventListener('click', () => {
    logContainer.classList.toggle('expanded');
    toggleBtn.textContent = logContainer.classList.contains('expanded') ? 'Hide Log' : 'Show Log';
  });
  
  function addLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'luceta-log-entry';
    entry.innerHTML = `<span class="luceta-log-time">[${time}]</span> <span class="luceta-log-${type}">${message}</span>`;
    logContainer.prepend(entry);
    
    // Keep only last 50 entries
    while (logContainer.children.length > 50) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }
  
  function updateStats() {
    document.getElementById('stat-checkout').textContent = stats.checkoutCalls;
    document.getElementById('stat-listings').textContent = stats.listingsCalls;
    document.getElementById('stat-upload').textContent = stats.uploadCalls;
    document.getElementById('stat-mocked').textContent = stats.mockedRequests;
  }
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const startTime = Date.now();
    
    // Track specific endpoints
    if (url.includes('/api/checkout')) {
      stats.checkoutCalls++;
      addLog(`→ Checkout request initiated`, 'info');
    } else if (url.includes('/api/listings')) {
      stats.listingsCalls++;
      addLog(`→ NFT listings request`, 'info');
    } else if (url.includes('/api/upload')) {
      stats.uploadCalls++;
      addLog(`→ IPFS upload request`, 'info');
    }
    
    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;
      
      // Clone response to check if mocked
      const cloned = response.clone();
      try {
        const data = await cloned.json();
        if (data.mocked_by === 'Requestly' || data.demo_mode) {
          stats.mockedRequests++;
          addLog(`✓ MOCKED: ${url.split('/api/')[1] || url} (${duration}ms)`, 'mock');
        } else {
          addLog(`✓ REAL: ${url.split('/api/')[1] || url} (${duration}ms)`, 'real');
        }
      } catch (e) {
        // Not JSON response
      }
      
      updateStats();
      return response;
    } catch (error) {
      addLog(`✗ ERROR: ${url} - ${error.message}`, 'error');
      throw error;
    }
  };
  
  // Initial log
  addLog('🚀 Luceta Demo Mode initialized', 'info');
  addLog('📡 Requestly API mocking active', 'mock');
  
  console.log('%c[Requestly] Luceta Demo Mode Active', 
    'background: #156d95; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
})();
