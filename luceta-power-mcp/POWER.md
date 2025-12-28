---
name: luceta
displayName: Luceta
description: Generate immersive game sound effects, character voices, ambient audio, and music using AI
keywords:
  - game audio
  - sfx
  - sound effects
  - game sfx
  - game sounds
  - npc voices
  - character voices
  - game music
  - ambient audio
  - combat sounds
  - ui sounds
  - footsteps
  - explosions
  - magic sounds
---

# Luceta - Game Audio Power

Generate immersive game sound effects, character voices, and ambient audio using AI. Luceta understands game contexts and scenes, translating your creative vision into professional-quality audio assets.

## Prerequisites

1. Get your API key from [ElevenLabs](https://elevenlabs.io) (free tier: 10k credits/month)
2. Install `uv` if not already installed:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
3. Update `ELEVENLABS_API_KEY` in mcp.json with your key.

## Capabilities

### 🎮 Game Sound Effects
Generate SFX for any game scenario:
- Combat sounds (sword clashes, explosions, gunfire)
- Environmental audio (footsteps, doors, weather)
- UI/UX sounds (button clicks, notifications, level-ups)
- Creature sounds (monster roars, animal calls)
- Magic & abilities (spell casting, power-ups)

### 🎭 Character Voices
- Generate NPC dialogue and barks
- Create unique character voices
- Clone voices for consistent characters
- Multi-language voice acting

### 🌍 Ambient Audio
- Background atmospheres (forest, dungeon, city)
- Dynamic environmental sounds
- Loopable ambient tracks

### 🎵 Game Music
- Generate background music from prompts
- Create mood-specific tracks
- Compose adaptive music segments

## Example Prompts

### Sound Effects
- "Generate SFX for a medieval sword hitting a shield"
- "Create footstep sounds for a character walking on gravel"
- "Make a magical portal opening sound effect"
- "Generate UI sound for collecting a coin"

### Character Voices
- "Generate an old wizard NPC saying 'The darkness approaches, young hero'"
- "Create a gruff orc voice saying 'You shall not pass!'"
- "Make a cheerful shopkeeper greeting"

### Ambient
- "Create ambient audio for a spooky dungeon"
- "Generate forest atmosphere with birds and wind"

### Music
- "Compose battle music for a boss fight"
- "Create calm exploration music for a village"

## Output

All generated audio saves to `$HOME/Desktop` by default. Supported formats:
- MP3 (default, various bitrates)
- WAV/PCM
- OGG/Opus

## Cost Warning

⚠️ Each generation uses ElevenLabs credits. Monitor usage at [elevenlabs.io](https://elevenlabs.io).

## Troubleshooting

### uvx not found
```bash
which uvx
```
Update mcp.json with the full path if needed.

### Long generation times
Complex audio (music, voice design) may take 10-30 seconds. This is normal.
