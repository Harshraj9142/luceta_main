# Requestly Manual Setup Guide - Luceta Payment Testing

Since JSON import formats vary, here's how to create each rule manually in Requestly.

---

## Rule 1: Mock Checkout Success (Modify Response)

1. Click **"+ New Rule"** → Select **"Modify API Response"**
2. **Name**: `Mock Checkout Success`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `/api/checkout`
4. **Response Body** (paste this):

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
  "message": "This is a mock response from Requestly"
}
```

5. **Status Code**: `200`
6. Click **Save**

---

## Rule 2: Mock Webhook Events (Modify Response)

1. Click **"+ New Rule"** → Select **"Modify API Response"**
2. **Name**: `Mock Webhook Events`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `/api/webhooks/dodo`
4. **Response Body**:

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

5. **Status Code**: `200`
6. Click **Save**

---

## Rule 3: Payment Delay Simulator (Delay Rule)

1. Click **"+ New Rule"** → Select **"Delay Network Requests"**
2. **Name**: `Payment Delay 3 Seconds`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `/api/checkout`
4. **Delay**: `3000` (milliseconds)
5. Click **Save**

---

## Rule 4: Demo Mode Banner (Insert Script)

1. Click **"+ New Rule"** → Select **"Insert Custom Scripts"**
2. **Name**: `Demo Mode Banner Injector`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `localhost:3000`
4. **Script Type**: JavaScript
5. **Insert**: After Page Load
6. **Code** (paste this):

```javascript
(function() {
  if (document.getElementById('requestly-demo-banner')) return;
  
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
      padding: 10px 20px;
      text-align: center;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 99999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
      🎵 DEMO MODE - Payments are simulated via Requestly | No real transactions
    </div>
  `;
  document.body.prepend(banner);
  document.body.style.paddingTop = '44px';
  console.log('[Requestly] Demo Mode Banner injected');
})();
```

7. Click **Save**

---

## Rule 5: Add Test Mode Headers (Modify Headers)

1. Click **"+ New Rule"** → Select **"Modify Headers"**
2. **Name**: `Add Test Mode Headers`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `/api/`
4. **Request Headers** → Click **"+ Add Header"**:
   - Header: `X-Luceta-Test-Mode`
   - Value: `true`
5. Click **"+ Add Header"** again:
   - Header: `X-Requestly-Enabled`
   - Value: `payment-testing`
6. Click **Save**

---

## Rule 6: Chaos Mode - Random Failures (Modify Response with Code)

1. Click **"+ New Rule"** → Select **"Modify API Response"**
2. **Name**: `Chaos Mode - Random Failures`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `/api/checkout`
4. **Response Type**: Select **"Programmatic (JavaScript)"** or **"Dynamic"**
5. **Code** (paste this):

```javascript
function modifyResponse(args) {
  const shouldFail = Math.random() < 0.3;
  
  if (shouldFail) {
    const errors = [
      { code: 500, message: 'Internal Server Error' },
      { code: 503, message: 'Service Unavailable' },
      { code: 429, message: 'Too Many Requests' }
    ];
    const error = errors[Math.floor(Math.random() * errors.length)];
    
    return {
      body: JSON.stringify({
        success: false,
        error: error.message,
        error_code: 'CHAOS_MODE_FAILURE',
        message: 'Simulated failure from Requestly Chaos Mode'
      }),
      statusCode: error.code
    };
  }
  return {};
}
```

6. Click **Save**

---

## Rule 7: Redirect Dodo API to Local (Redirect Rule)

1. Click **"+ New Rule"** → Select **"Redirect Request"**
2. **Name**: `Redirect Dodo to Local Mock`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `test.dodopayments.com`
4. **Redirect To**: `http://localhost:3001/mock-dodo`
5. Click **Save**

---

## Rule 8: Block Payment Requests (Cancel Request)

1. Click **"+ New Rule"** → Select **"Cancel Request"**
2. **Name**: `Block All Payments (Emergency)`
3. **URL Condition**: 
   - Operator: `Contains`
   - Value: `dodopayments.com`
4. Click **Save**
5. Keep this **DISABLED** - only for emergencies!

---

## Testing Checklist

After creating rules, test each one:

- [ ] **Rule 1**: Click checkout → Should return mock JSON instantly
- [ ] **Rule 2**: Trigger webhook → Should return mock event
- [ ] **Rule 3**: Click checkout → Should have 3s delay
- [ ] **Rule 4**: Refresh page → Should see blue banner at top
- [ ] **Rule 5**: Check DevTools Network → Should see custom headers
- [ ] **Rule 6**: Click checkout 10 times → ~3 should fail randomly

---

## Quick Enable/Disable

For demo video, enable rules in this order:
1. First show normal flow (all rules OFF)
2. Enable Rule 1 (Mock Success) - show instant response
3. Enable Rule 4 (Demo Banner) - show injected UI
4. Enable Rule 3 (Delay) - show loading state
5. Enable Rule 6 (Chaos) - show error handling

---

## Export Your Rules

After creating all rules:
1. Go to Rules list
2. Select all Luceta rules
3. Click **"..."** menu → **"Export"**
4. Save as `luceta-rules-export.json`
5. Include in your repo for submission!
