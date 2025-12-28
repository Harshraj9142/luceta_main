# Luceta Audio Platform - Requestly Integration 🎵

## Overview

This folder contains a comprehensive Requestly ruleset for testing and developing the Luceta Audio Platform's Dodo Payments integration. These rules demonstrate advanced Requestly features for the hackathon submission.

## 🏆 Hackathon Submission

**Track**: Most Creative Use of Requestly ($200 Prize)

**What We Built**: A complete payment testing toolkit that enables:
- Offline development without real API calls
- Chaos engineering for resilience testing
- A/B testing for pricing strategies
- Demo mode for sales presentations

---

## Features Implemented (5 Requestly Rule Types)

### 1. 📝 **Modify Response Rule** - Mock Payment Success
Mock successful checkout sessions without hitting the real Dodo Payments API.
- Returns realistic checkout URLs
- Includes product details and metadata
- Works completely offline

### 2. 🔄 **Redirect Rule** - Environment Switching
Redirect Dodo Payments API calls to local mock server.
- Switch between test/live environments instantly
- Enable offline development mode
- No code changes required

### 3. ⏱️ **Delay Rule** - Network Latency Testing
Simulate slow network conditions (3 second delay).
- Test loading states and spinners
- Verify timeout handling
- UX testing for slow connections

### 4. 💉 **Insert Script Rule** - Demo Mode Banner
Inject visual indicators and tracking scripts.
- "DEMO MODE" banner for sales demos
- Checkout attempt counter
- Console logging for debugging

### 5. 🔧 **Modify Headers Rule** - Test Mode Headers
Add custom headers to identify test requests.
- `X-Luceta-Test-Mode: true`
- `X-Requestly-Enabled: payment-testing`
- Useful for backend logging

### BONUS: 💥 **Chaos Mode** - Random Failures
Programmatic response modification for resilience testing.
- 30% random failure rate
- Multiple error types (500, 503, 429, 402)
- Visual chaos indicator

### BONUS: 🧪 **Regex-Based Product Matching**
Different mock responses based on product ID patterns.
- Starter plan mock response
- Enterprise plan mock response
- Dynamic pricing data

---

## Installation

### Step 1: Install Requestly
Download from [requestly.io/downloads](https://requestly.io/downloads/)

### Step 2: Create Rules Manually
**⚠️ JSON import format varies by version. Use manual setup instead.**

👉 **Follow: [MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md)**

This guide has copy-paste ready configurations for all 8 rules.

### Step 3: Activate Rules
Enable rules individually based on your testing needs:
- **Demo Mode**: Rules 1, 4, 5
- **Chaos Testing**: Rules 1, 6
- **Offline Dev**: Rules 1, 2, 3

---

## Rules Reference

| # | Rule Name | Type | URL Pattern | Purpose |
|---|-----------|------|-------------|---------|
| 1 | Mock Checkout Success | Response | `/api/checkout` | Return mock success |
| 2 | Mock Webhook Events | Response | `/api/webhooks/dodo` | Simulate webhooks |
| 3 | Redirect to Local Mock | Redirect | `test.dodopayments.com` | Offline mode |
| 4 | Payment Delay (3s) | Delay | `/api/checkout` | Test loading states |
| 5 | Demo Mode Banner | Script | `localhost:3000` | Inject UI banner |
| 6 | Chaos Mode | Response | `/api/checkout` | Random failures |
| 7 | Test Mode Headers | Headers | `/api/` | Add debug headers |
| 8 | Product Variants (Regex) | Response | `/api/checkout.*product_id` | Dynamic mocks |

---

## Demo Video Script (30 seconds)

```
0:00 - Show Luceta pricing page
0:05 - Click "Get Started" - show real checkout flow
0:10 - Enable "Mock Checkout Success" rule
0:15 - Click "Get Started" - show mock response (no API call!)
0:20 - Enable "Demo Mode Banner" - show injected UI
0:25 - Enable "Chaos Mode" - show error handling
0:30 - Show Requestly dashboard with all rules
```

---

## File Structure

```
requestly/
├── README.md                          # This file
├── luceta-payment-rules.json          # Importable Requestly rules
├── mock-responses/
│   ├── checkout-success.json          # Success response template
│   ├── checkout-failure.json          # Failure response template
│   └── webhook-payment-completed.json # Webhook event template
└── scripts/
    ├── demo-mode-banner.js            # Demo banner injection
    ├── chaos-mode.js                  # Chaos engineering script
    └── pricing-ab-test.js             # A/B testing injection
```

---

## Technical Highlights (For Judges)

### ✅ Technical Complexity
- **Regex matching**: Dynamic responses based on product ID patterns
- **Programmatic responses**: JavaScript-based chaos mode with random failures
- **Multiple rule types**: Response, Redirect, Delay, Script, Headers

### ✅ Utility
- **Offline development**: Test payments without internet/API keys
- **Chaos engineering**: Verify error handling without breaking production
- **Sales demos**: Perfect demos without test accounts

### ✅ "Wow" Factor
- **One-click environment switching**: Demo → Chaos → Offline
- **Visual indicators**: Injected banners show current mode
- **Complete toolkit**: Not just one rule, but a full testing suite

---

## Use Cases Demonstrated

1. **QA Testing**: Mock different payment scenarios
2. **Sales Demos**: Show checkout flow without real transactions
3. **Offline Development**: Work without API connectivity
4. **Resilience Testing**: Verify error handling with chaos mode
5. **A/B Testing**: Test pricing strategies without code changes

---

## License

MIT - Built for Dodo Payments Hackathon 2025
