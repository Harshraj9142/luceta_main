# Luceta Development Setup Guide

## Quick Start for Localhost Webhooks

### Step 1: Install ngrok
```bash
# Option A: Download from https://ngrok.com/download
# Option B: Install via npm
npm install -g ngrok

# Option C: Windows (Chocolatey)
choco install ngrok

# Option D: macOS (Homebrew)
brew install ngrok
```

### Step 2: Setup Environment
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your actual values:
# DODO_PAYMENTS_API_KEY=your_actual_api_key_here
# DODO_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 3: Start Development
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

### Step 4: Configure Webhook
1. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
2. Go to [Dodo Payments Dashboard](https://dashboard.dodopayments.com)
3. Navigate to Webhooks section
4. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/dodo`
5. Select events: `payment.completed`, `payment.failed`, `subscription.created`, `subscription.cancelled`, `refund.created`

### Step 5: Test Integration

#### Quick Test Commands:
```bash
# Test webhook endpoint health
node scripts/test-webhook.js

# Test payment integration
node scripts/test-payments.js

# Run complete test suite
node scripts/run-tests.js
```

#### Manual Test:
```bash
# Test webhook endpoint
curl -X GET https://your-ngrok-url.ngrok.io/api/webhooks/dodo

# Expected response:
# {"status":"healthy","service":"luceta-dodo-webhooks","timestamp":"..."}
```

## Test Scripts

### 1. Webhook Tests (`scripts/test-webhook.js`)
- Tests webhook endpoint health
- Simulates payment events
- Verifies event processing
- Tests signature verification

**Usage:**
```bash
# Set environment variables
export WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/webhooks/dodo"
export DODO_WEBHOOK_SECRET="your_webhook_secret"

# Run webhook tests
node scripts/test-webhook.js
```

### 2. Payment Tests (`scripts/test-payments.js`)
- Tests Dodo Payments API connectivity
- Creates checkout sessions
- Generates payment links
- Tests all product configurations

**Usage:**
```bash
# Make sure .env.local is configured, then:
node scripts/test-payments.js
```

### 3. Complete Test Suite (`scripts/run-tests.js`)
- Runs all tests in sequence
- Provides comprehensive integration testing
- Shows overall system health

**Usage:**
```bash
node scripts/run-tests.js
```

## Alternative: Cloudflare Tunnel (Free)

```bash
# Install
npm install -g cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000

# Use the provided HTTPS URL for webhooks
```

## Troubleshooting

### Common Issues:

1. **ngrok not found**: Make sure it's installed and in your PATH
2. **Webhook not receiving events**: Check the URL in Dodo Payments dashboard
3. **CORS errors**: Make sure you're using HTTPS URLs from ngrok
4. **Environment variables**: Ensure `.env.local` is properly configured
5. **API key issues**: Verify your Dodo Payments API key is correct
6. **Test failures**: Run individual test scripts to isolate issues

### Debug Webhook Events:

Check your Next.js console for webhook logs:
```
Processing webhook event: payment.completed abc123
Payment completed: { payment_id: 'pay_123', customer_id: 'cus_456', ... }
```

### Environment Variables Checklist:

Create `.env.local` with:
```bash
DODO_PAYMENTS_API_KEY=your_actual_api_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_RETURN_URL=http://localhost:3000/checkout/success
```

## Production Notes

- Replace ngrok URL with your actual domain
- Set `DODO_PAYMENTS_ENVIRONMENT=live_mode`
- Implement proper webhook signature verification
- Use HTTPS for all production URLs
- Test thoroughly before going live