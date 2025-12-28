# Requestly Complete Setup Guide - Luceta Payment Testing 🎵

## Overview

This guide walks you through creating **5 Requestly rules** for testing Dodo Payments integration.

---

# RULE 1: Mock Checkout Success ✅

**Purpose**: Return fake checkout data without calling real Dodo API

## Steps:

### Step 1.1: Click "Modify Response" in left sidebar
![Step 1](screenshots/rule1-step1.png)

### Step 1.2: Select "REST API"
![Step 2](screenshots/rule1-step2.png)

### Step 1.3: Fill in the form

**Rule name**: 
```
Mock Checkout Success
```

**If request → URL → Contains**:
```
/api/checkout
```

**Response Status Code**:
```
200
```

**Response Body** (select "Static Data", paste this):
```json
{
  "success": true,
  "checkout_url": "https://demo.dodopayments.com/checkout/mock_session_123",
  "session_id": "mock_session_123",
  "product": {
    "id": "pdt_mock_001",
    "name": "Pro Plan (DEMO)",
    "price": "$99.00",
    "category": "pro"
  },
  "demo_mode": true,
  "message": "Mocked by Requestly"
}
```

### Step 1.4: Check "Serve this response body without making a call to the server"

### Step 1.5: Click "+Save rule" (blue button top right)

**✅ Rule 1 Complete!**

---

# RULE 2: Payment Delay 3 Seconds ⏱️

**Purpose**: Add 3 second delay to test loading states

## Steps:

### Step 2.1: Click "Delay Network Requests" in left sidebar (under "Others")

### Step 2.2: Fill in the form

**Rule name**: 
```
Payment Delay 3 Seconds
```

**If request → URL → Contains**:
```
/api/checkout
```

**Delay (in ms)**:
```
3000
```

### Step 2.3: Click "+Save rule"

**✅ Rule 2 Complete!**

---

# RULE 3: Demo Mode Banner 🎵

**Purpose**: Inject a visual banner showing "Demo Mode" on the page

## Steps:

### Step 3.1: Click "Insert Scripts" in left sidebar (under "Others")

### Step 3.2: Fill in the form

**Rule name**: 
```
Demo Mode Banner
```

**If request → URL → Contains**:
```
localhost:3000
```

### Step 3.3: Add JavaScript code

Click "Add Script" or find the code editor area.

**Select**: Custom JavaScript

**Code to paste**:
```javascript
(function() {
  // Prevent double injection
  if (document.getElementById('requestly-demo-banner')) return;
  
  // Create banner
  const banner = document.createElement('div');
  banner.id = 'requestly-demo-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #156d95, #1e7ba8);
      color: white;
      padding: 12px 20px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 99999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
      🎵 DEMO MODE - Payments are simulated via Requestly | No real transactions
    </div>
  `;
  
  // Add to page
  document.body.prepend(banner);
  document.body.style.paddingTop = '48px';
  
  // Log to console
  console.log('[Requestly] Demo Mode Banner injected successfully');
})();
```

### Step 3.4: Click "+Save rule"

**✅ Rule 3 Complete!**

---

# RULE 4: Add Test Mode Headers 🔧

**Purpose**: Add custom headers to identify test requests

## Steps:

### Step 4.1: Click "Modify Headers" in left sidebar (under "Headers")

### Step 4.2: Fill in the form

**Rule name**: 
```
Add Test Mode Headers
```

**If request → URL → Contains**:
```
/api/
```

### Step 4.3: Add Request Headers

Click "+ Add Header" and add:

| Header Name | Header Value |
|-------------|--------------|
| `X-Luceta-Test-Mode` | `true` |
| `X-Requestly-Enabled` | `payment-testing` |

### Step 4.4: Click "+Save rule"

**✅ Rule 4 Complete!**

---

# RULE 5: Mock Webhook Events 📨

**Purpose**: Return fake webhook responses for testing

## Steps:

### Step 5.1: Click "Modify Response" in left sidebar

### Step 5.2: Select "REST API"

### Step 5.3: Fill in the form

**Rule name**: 
```
Mock Webhook Events
```

**If request → URL → Contains**:
```
/api/webhooks/dodo
```

**Response Status Code**:
```
200
```

**Response Body**:
```json
{
  "success": true,
  "event_id": "evt_mock_webhook_001",
  "event_type": "payment.completed",
  "message": "Mock webhook processed successfully",
  "data": {
    "payment_id": "pay_mock_123",
    "amount": 9900,
    "currency": "USD",
    "customer_email": "demo@luceta.audio"
  }
}
```

### Step 5.4: Click "+Save rule"

**✅ Rule 5 Complete!**

---

# Testing Your Rules 🧪

## Step 1: Start your dev server
```bash
npm run dev
```

## Step 2: Open http://localhost:3000

## Step 3: Enable rules one by one in Requestly

### Test Rule 1 (Mock Checkout):
1. Toggle "Mock Checkout Success" → ON
2. Click any "Get Started" button on pricing page
3. Check DevTools → Network tab
4. You should see instant mock response (no real API call!)

### Test Rule 2 (Delay):
1. Toggle "Payment Delay 3 Seconds" → ON
2. Click "Get Started"
3. Notice the 3-second delay before response

### Test Rule 3 (Demo Banner):
1. Toggle "Demo Mode Banner" → ON
2. Refresh the page
3. You should see blue banner at top: "🎵 DEMO MODE"

### Test Rule 4 (Headers):
1. Toggle "Add Test Mode Headers" → ON
2. Make any API request
3. In DevTools → Network → select request → Headers
4. You should see `X-Luceta-Test-Mode: true`

---

# Export Rules for Submission 📦

## Step 1: Go to Rules list

## Step 2: Select all 5 Luceta rules (checkbox)

## Step 3: Click "..." menu → "Export"

## Step 4: Save as `luceta-requestly-rules.json`

## Step 5: Add to your repo in `requestly/` folder

---

# Demo Video Script 🎬

Record a 30-second video showing:

```
0:00 - Show Requestly dashboard with 5 rules
0:05 - Show localhost:3000 pricing page (rules OFF)
0:10 - Enable "Mock Checkout" → Click "Get Started" → Show instant mock response
0:18 - Enable "Demo Banner" → Refresh → Show blue banner
0:25 - Show DevTools Network tab with mocked response
0:30 - End with Requestly dashboard
```

---

# Summary

| # | Rule Name | Type | URL Pattern |
|---|-----------|------|-------------|
| 1 | Mock Checkout Success | Modify Response | `/api/checkout` |
| 2 | Payment Delay 3 Seconds | Delay | `/api/checkout` |
| 3 | Demo Mode Banner | Insert Scripts | `localhost:3000` |
| 4 | Add Test Mode Headers | Modify Headers | `/api/` |
| 5 | Mock Webhook Events | Modify Response | `/api/webhooks/dodo` |

---

# Troubleshooting

| Issue | Solution |
|-------|----------|
| Rules not working | Make sure "Enabled" toggle is ON (top right) |
| No interception | Refresh the page after enabling rules |
| Script not injecting | Check URL pattern matches exactly |
| Headers not showing | Check DevTools → Network → Request Headers |

---

**Good luck with the hackathon! 🏆**
