---
inclusion: always
---

# Game Character Voice Generation

Guide for generating NPC dialogue, character barks, and voice acting for games.

## Voice Generation Strategy

When users request character voices:
1. Identify character archetype
2. Search for matching voice in library OR describe voice for generation
3. Use `text_to_speech` for dialogue
4. Use `voice_clone` for recurring characters (if user provides samples)

## Character Archetypes → Voice Settings

### Heroes & Protagonists
| Archetype | Voice Search | Stability | Style |
|-----------|--------------|-----------|-------|
| Young Hero | "young male confident" | 0.5 | 0.3 |
| Warrior | "deep male strong" | 0.7 | 0.2 |
| Mage | "wise mysterious" | 0.6 | 0.4 |
| Rogue | "sly quick witty" | 0.4 | 0.5 |
| Female Lead | "young female determined" | 0.5 | 0.3 |

### NPCs & Villagers
| Archetype | Voice Search | Stability | Style |
|-----------|--------------|-----------|-------|
| Shopkeeper | "friendly warm merchant" | 0.7 | 0.3 |
| Innkeeper | "welcoming jovial" | 0.6 | 0.4 |
| Guard | "stern authoritative" | 0.8 | 0.1 |
| Elder | "old wise gentle" | 0.7 | 0.2 |
| Child | "young child innocent" | 0.5 | 0.4 |
| Peasant | "common humble" | 0.6 | 0.2 |

### Villains & Antagonists
| Archetype | Voice Search | Stability | Style |
|-----------|--------------|-----------|-------|
| Dark Lord | "deep menacing villain" | 0.8 | 0.5 |
| Witch | "cackling sinister female" | 0.4 | 0.6 |
| Corrupt Noble | "arrogant sophisticated" | 0.7 | 0.4 |
| Bandit | "rough aggressive" | 0.5 | 0.3 |
| Demon | "demonic deep evil" | 0.6 | 0.7 |

### Fantasy Races
| Race | Voice Search | Notes |
|------|--------------|-------|
| Elf | "ethereal elegant" | Higher pitch, melodic |
| Dwarf | "gruff scottish deep" | Lower pitch, hearty |
| Orc | "brutal guttural" | Aggressive, rough |
| Goblin | "high pitched sneaky" | Fast, mischievous |
| Giant | "booming slow" | Very deep, deliberate |

## Dialogue Types

### Barks (Short Combat/Action Lines)
- Keep under 5 words
- High energy, clear emotion
- Examples: "For glory!", "You'll pay!", "Watch out!"

### Greetings
- Warm, inviting tone
- Character-appropriate formality
- Examples: "Welcome, traveler", "What brings you here?"

### Quest Dialogue
- Clear, informative
- Moderate pace for comprehension
- Include emotional hooks

### Combat Taunts
- Aggressive, confident
- Short and punchy
- Match character personality

## Tool Call Patterns

### Generate NPC Line
```
Tool: text_to_speech
- text: [dialogue line]
- voice_name: [search result or specify]
- stability: [from archetype table]
- style: [from archetype table]
- speed: 1.0 (adjust for character)
```

### Search for Voice First
```
Tool: search_voices
- search: [archetype keywords]

Then use returned voice_id in text_to_speech
```

### Clone Recurring Character
```
Tool: voice_clone
- name: "[Character Name] Voice"
- files: [user-provided audio samples]
- description: "[character description for reference]"
```

## Example Translations

**User**: "Generate a grumpy dwarf blacksmith saying 'Aye, that'll cost ye fifty gold pieces'"
**Action**:
1. `search_voices` with search: "gruff deep scottish"
2. `text_to_speech` with:
   - text: "Aye, that'll cost ye fifty gold pieces"
   - voice_name: [from search]
   - stability: 0.7
   - style: 0.3
   - speed: 0.9

**User**: "Evil wizard boss intro line"
**Action**:
1. `search_voices` with search: "menacing deep villain"
2. `text_to_speech` with:
   - text: [user's line or suggest dramatic intro]
   - stability: 0.8
   - style: 0.6
   - speed: 0.85

**User**: "I have audio of my friend, make them a recurring NPC"
**Action**:
1. `voice_clone` with provided files
2. Use cloned voice_id for all future dialogue
