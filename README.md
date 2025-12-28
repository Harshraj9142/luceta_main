# Luceta Audio Platform 🎵

> **AI-Powered Audio for Game Developers** — From Code to Sound in One Click

![Luceta Banner](public/placeholder.jpg)

---

## 🎮 The Problem Game Developers Face

Building game audio is **painful, expensive, and time-consuming**:

- ❌ **Hiring Sound Designers** costs $50-200/hour — out of reach for indie devs
- ❌ **Royalty-Free Libraries** have generic sounds that don't match your game's vibe
- ❌ **Manual Audio Integration** requires writing boilerplate code for every sound
- ❌ **No AI Tools for Game Audio** — ChatGPT can't analyze your game code or generate contextual SFX
- ❌ **Expensive Iterations** — every gameplay change needs new audio, burning time and budget
- ❌ **No MCP Integration** — AI assistants can't help with game audio workflows in the AI era

**Result:** Indie developers ship games with **no audio** or **placeholder sounds**, killing player immersion.

---

## ✨ The Luceta Solution

**AI-powered audio generation that understands your game code** — no manual work required.

### 🚀 Godot Plugin: One-Click Audio Magic

- ✅ **Analyze Code** → AI scans your `.gd` scripts and detects game events (jumps, coins, deaths)
- ✅ **Auto-Generate SFX** → ElevenLabs creates contextual sound effects from text descriptions
- ✅ **Auto-Integrate** → Sounds are automatically wired into your game scripts (no coding!)
- ✅ **NPC Voice Acting** → Generate character dialog with AI voices (no voice actors needed)
- ✅ **Background Music** → Create looping ambient tracks and BGM
- ✅ **Re-prompt & Iterate** → Don't like a sound? Edit the description and regenerate instantly
- ✅ **Game Logic Detection** → Plugin understands player actions, collectibles, enemies, UI events

### 🌐 Web Platform: Monetize Your Audio

- ✅ **NFT Marketplace** → Mint and sell music as NFTs on Ethereum (IPFS + smart contracts)
- ✅ **Subscription Tiers** → Starter ($9), Pro ($29), Enterprise ($99) via Dodo Payments
- ✅ **AI Voice Agent** → 24/7 support with ElevenLabs conversational AI (can call your phone!)

### 🛠️ Developer Tools

- ✅ **Requestly Mocks** → Test without burning API credits or gas fees
- ✅ **MCP Server** → AI assistants can generate game audio via Model Context Protocol
- ✅ **Smart Contracts** → Decentralized NFT trading with 2.5% marketplace fee

---

## 🎯 How It Works (Godot Plugin)

```
1. Click "Analyze Code" 
   → AI scans player.gd, coin.gd, killzone.gd

2. Review AI Suggestions
   → "player_jump" - Powerful whoosh with springy pop
   → "coin_collect" - Bright sparkle with magical shimmer
   → "player_death" - Dramatic impact with descending tone

3. Click "Generate Audio"
   → ElevenLabs creates MP3 files in 30 seconds

4. Click "Integrate"
   → Sounds auto-wired into your scripts:
      • Variables declared
      • Files loaded in _ready()
      • _play_sfx() calls added at right moments

5. Press Play
   → Your game now has professional audio! 🎉
```

**No coding. No manual integration. Just AI magic.**

---

## �️ ElkevenLabs Integration: 4 Ways We Use AI Audio

<table>
<tr>
<td width="50%">

### i. ElevenLabs API (Godot Plugin)

![Godot Panel](static/godot-panel.png)

- 🎵 **Text-to-Speech (TTS)** — Generate NPC dialog voices in 29 languages
- 🔊 **Sound Effect Generation** — Create game SFX from text descriptions
- 🎼 **Background Music (BGM)** — Generate looping ambient tracks
- 🎶 **Music Generation** — Create custom game soundtracks
- ⚡ **Real-time Generation** — Audio ready in 30 seconds directly in Godot Editor

</td>
<td width="50%">

### ii. ElevenLabs MCP Server

![MCP Integration](static/Screenshot%202025-12-28%20at%209.32.38%20AM.png)

- 🤖 **AI Assistant Integration** — Kiro/Claude can generate game audio via MCP
- 🔧 **Tool Calling** — AI understands game context and creates appropriate sounds
- 📦 **Batch Generation** — Generate multiple sounds in one conversation
- 🔄 **Iterative Refinement** — AI can re-prompt and improve audio based on feedback
- 🎯 **Context-Aware** — MCP server analyzes game code to suggest relevant audio

</td>
</tr>
<tr>
<td width="50%">

### iii. ElevenLabs Conversational AI Agent

![Agent Workflow](static/agent-work.jpeg)

- 📞 **Voice Chat Support** — 24/7 AI agent with WebRTC voice calls
- 📧 **Gmail Integration** — Agent can send subscription confirmations via email
- 📅 **Calendly Tool Calling** — Schedule demo calls automatically
- 🎤 **Outbound Phone Calls** — Agent can call users via Twilio integration
- 💬 **Multi-turn Conversations** — Handles complex support queries with context

</td>
<td width="50%">

### iv. ElevenLabs React UI Library

![UI Library](static/Screenshot%202025-12-28%20at%209.35.29%20AM.png)

- 🎨 **Pre-built Components** — `<Conversation>` component with orb animation
- 🌐 **Web Integration** — Embedded AI agent on homepage for instant support
- 🎭 **Custom Styling** — Shimmering text effects and glassmorphism design
- 🔊 **Audio Visualization** — Real-time waveform during voice conversations
- ⚡ **Zero Config** — Just pass agent ID and it works out of the box

</td>
</tr>
</table>

---

## 🏆 Hackathon Tracks

This project is submitted for multiple hackathon tracks:

| Track | Integration | Prize |
|-------|-------------|-------|
| **Dodo Payments** | Payment processing & checkout | Main Track |
| **Requestly** | API mocking & testing toolkit | $200 Creative Use |
| **ElevenLabs** | AI sound effects & voice generation | Audio Track |

---

## 🚀 Features

### 🌐 Web Platform
- **Landing Page** — Modern, responsive design with Framer Motion animations
- **Pricing Section** — Three-tier pricing (Starter $29, Pro $99, Enterprise $299)
- **Audio Marketplace** — Browse and purchase audio assets
- **Checkout Flow** — Seamless Dodo Payments integration

### 🎮 Godot Game Plugin
- **AI Sound Effects** — Generate SFX from text descriptions using ElevenLabs
- **AI Dialog** — Text-to-speech for NPC voices
- **Real-time Generation** — Create audio directly in Godot Editor

### 🔧 Developer Tools
- **Requestly Rules** — Mock payments, test errors, inject demo UI
- **MCP Server** — AI-powered sound generation via Model Context Protocol

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| **Payments** | Dodo Payments SDK |
| **Audio AI** | ElevenLabs API |
| **Game Engine** | Godot 4.x |
| **Testing** | Requestly HTTP Rules |
| **AI Integration** | MCP (Model Context Protocol) |

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Dodo Payments account
- ElevenLabs API key (for game plugin)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/luceta-audio.git
cd luceta-audio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Dodo Payments
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_WEBHOOK_SECRET=your_webhook_secret

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_RETURN_URL=http://localhost:3000/checkout/success
```

---

## 💳 Dodo Payments Integration

### Features Implemented
- ✅ Checkout session creation
- ✅ Payment link generation
- ✅ Webhook handling (payment.completed, payment.failed)
- ✅ Product management
- ✅ Multi-tier pricing

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkout` | POST | Create checkout session |
| `/api/checkout` | GET | Generate quick payment link |
| `/api/webhooks/dodo` | POST | Handle webhook events |
| `/api/webhooks/dodo` | GET | Health check |

### Products

| Plan | Price | Product ID |
|------|-------|------------|
| Starter | $29/mo | `pdt_0NV05r1az5RQRr1hkm43c` |
| Pro | $99/mo | `pdt_0NV05rFxgWtor793xLtta` |
| Enterprise | $299/mo | `pdt_0NV05rVPbCml7XEvuLW9R` |

### Testing Payments

```bash
# Run payment tests
node scripts/test-payments.js

# Run integration tests
node scripts/test-integration.js

# Run frontend tests
node scripts/test-frontend.js
```

---

## 🧪 Requestly Integration

We use Requestly for API mocking, testing, and development without real API calls.

### Rules Created

| Rule | Type | Purpose |
|------|------|---------|
| Mock Checkout Success | Modify Response | Return fake checkout data |
| Payment Delay 3s | Delay | Test loading states |
| Demo Mode Banner | Insert Scripts | Inject visual indicator |
| Test Mode Headers | Modify Headers | Add debug headers |
| Mock Webhook Events | Modify Response | Simulate webhooks |

### Setup Requestly

1. Install [Requestly Browser Extension](https://requestly.io/downloads/)
2. Open Requestly Dashboard
3. Create rules following [`requestly/COMPLETE_SETUP_GUIDE.md`](requestly/COMPLETE_SETUP_GUIDE.md)

### Use Cases

- **Offline Development** — Test checkout without internet
- **Chaos Engineering** — Random failures to test error handling
- **Demo Mode** — Perfect demos without test accounts
- **A/B Testing** — Test pricing strategies

See [`requestly/README.md`](requestly/README.md) for full documentation.

---

## 🎮 Godot Game Plugin

The `godot-game/` folder contains a complete Godot 4.x project with ElevenLabs integration.

### Features

- **AI Sound Effects** (`lib/eleven_sfx.gd`) — Generate SFX from text
- **AI Dialog** (`lib/eleven_dialog.gd`) — Text-to-speech for NPCs
- **Editor Integration** — Generate audio directly in Godot

### Setup

1. Open `godot-game/` in Godot 4.x
2. Create `ELEVEN_LABS_API_KEY.txt` with your API key
3. Add `eleven_sfx.tscn` or `eleven_dialog.tscn` to your scene
4. Set description and click "Generate Audio"

### Example Usage

```gdscript
# In Godot Editor Inspector:
audio_name = "footstep_grass"
description = "character walking on grass, soft footstep"
duration_seconds = 1.0

# Click "Generate Audio" button
# Audio file saved to res://godotai/footstep_grass.mp3
```

See [`godot-game/ELEVENLABS_INTEGRATION_GUIDE.md`](godot-game/ELEVENLABS_INTEGRATION_GUIDE.md) for full documentation.

---

## 🤖 MCP Server (AI Sound Generation)

We built a Model Context Protocol server for AI-powered sound generation.

### What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with external tools. Our MCP server enables:

- Generate sound effects from text prompts
- Create NPC dialog audio
- Integrate with any MCP-compatible AI assistant

### Features

- **Text-to-SFX** — "Generate explosion sound for sci-fi game"
- **Text-to-Speech** — "Say 'Welcome adventurer' in a deep voice"
- **Batch Generation** — Generate multiple sounds at once

### Usage with AI Assistants

```
User: Generate a footstep sound on grass
AI: [Calls MCP tool] Generated footstep_grass.mp3

User: Create dialog "Hello traveler" for an old wizard NPC
AI: [Calls MCP tool] Generated wizard_greeting.mp3
```

### Configuration

Add to your MCP config (`.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "luceta-audio": {
      "command": "node",
      "args": ["path/to/luceta-mcp-server.js"],
      "env": {
        "ELEVEN_LABS_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

## 📁 Project Structure

```
luceta-audio/
├── app/                    # Next.js app router
│   ├── api/
│   │   ├── checkout/       # Payment endpoints
│   │   └── webhooks/       # Webhook handlers
│   ├── checkout/           # Checkout pages
│   ├── marketplace/        # Marketplace page
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── PricingSection.tsx  # Pricing with Dodo integration
│   ├── MarketplaceSection.tsx
│   └── ...
├── lib/
│   ├── dodo-payments.ts    # Dodo Payments client
│   └── utils.ts
├── godot-game/             # Godot plugin
│   ├── lib/
│   │   ├── eleven_sfx.gd   # Sound effects generator
│   │   └── eleven_dialog.gd # Dialog generator
│   └── ...
├── requestly/              # Requestly rules & docs
│   ├── COMPLETE_SETUP_GUIDE.md
│   ├── mock-responses/
│   └── scripts/
├── scripts/                # Test scripts
│   ├── test-payments.js
│   ├── test-frontend.js
│   └── test-integration.js
└── README.md               # This file
```

---

## 🧪 Testing

### Run All Tests

```bash
# Payment API tests
node scripts/test-payments.js

# Webhook tests
node scripts/test-webhook.js

# Frontend integration tests
node scripts/test-frontend.js

# Complete test suite
node scripts/run-tests.js
```

### Test with Requestly

1. Enable "Mock Checkout Success" rule
2. Click checkout button
3. Verify mock response in DevTools

---

## 🎬 Demo

### Video Demo
[Link to demo video]

### Live Demo
[Link to deployed site]

### Screenshots

| Landing Page | Pricing | Marketplace |
|--------------|---------|-------------|
| ![Landing](screenshots/landing.png) | ![Pricing](screenshots/pricing.png) | ![Marketplace](screenshots/marketplace.png) |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Dodo Payments  │────▶│   Webhooks      │
│   (Frontend)    │     │     API         │     │   Handler       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               ▼
        │                                       ┌─────────────────┐
        │                                       │   Database      │
        │                                       │   (Future)      │
        │                                       └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│   Requestly     │────▶│   Mock Server   │
│   (Testing)     │     │   (Dev Only)    │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   Godot Game    │────▶│   ElevenLabs    │
│   Plugin        │     │   API           │
└─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│   MCP Server    │
│   (AI Tools)    │
└─────────────────┘
```

---

## 📄 API Documentation

### POST /api/checkout

Create a checkout session.

**Request:**
```json
{
  "product_id": "pdt_0NV05rFxgWtor793xLtta",
  "customer": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "plan_type": "monthly",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.dodopayments.com/...",
  "session_id": "cs_xxx",
  "product": {
    "id": "pdt_xxx",
    "name": "Pro",
    "price": 99
  }
}
```

### POST /api/webhooks/dodo

Handle Dodo Payments webhook events.

**Events Handled:**
- `payment.completed` — Payment successful
- `payment.failed` — Payment failed
- `subscription.created` — New subscription
- `subscription.cancelled` — Subscription cancelled

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Dodo Payments](https://dodopayments.com) — Payment processing
- [ElevenLabs](https://elevenlabs.io) — AI audio generation
- [Requestly](https://requestly.io) — API testing tools
- [Godot Engine](https://godotengine.org) — Game engine

---

## 📞 Support

- **Discord**: [Join our server](#)
- **Email**: support@luceta.audio
- **Issues**: [GitHub Issues](https://github.com/yourusername/luceta-audio/issues)

---


