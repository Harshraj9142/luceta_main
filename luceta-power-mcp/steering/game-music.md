---
inclusion: always
---

# Game Music Generation

Guide for generating background music, battle themes, and ambient tracks for games.

## Music Generation Strategy

Use `compose_music` for background tracks and `create_composition_plan` for complex pieces.

## Game Scene → Music Prompt Mappings

### Combat & Action
| Scene | Music Prompt |
|-------|--------------|
| Boss Battle | "epic orchestral boss battle music, intense drums, dramatic brass, high stakes combat" |
| Regular Combat | "action combat music, fast tempo, driving percussion, tense strings" |
| Chase Scene | "urgent chase music, rapid tempo, building tension, cinematic pursuit" |
| Victory | "triumphant victory fanfare, heroic brass, celebratory orchestral" |
| Defeat | "somber defeat music, melancholic strings, slow tempo, loss" |

### Exploration
| Scene | Music Prompt |
|-------|--------------|
| Open World | "adventurous exploration music, hopeful melody, orchestral, discovery" |
| Forest | "peaceful forest exploration, gentle woodwinds, nature sounds, serene" |
| Desert | "mysterious desert music, middle eastern influences, vast and lonely" |
| Snow/Ice | "cold winter landscape music, crystalline sounds, ethereal, isolated" |
| Ocean | "nautical adventure music, sea shanty influence, waves, sailing" |

### Locations
| Location | Music Prompt |
|----------|--------------|
| Village | "cozy village music, warm acoustic, peaceful, community feeling" |
| Castle | "majestic castle theme, regal brass, medieval, grand halls" |
| Dungeon | "dark dungeon music, ominous, dripping echoes, danger lurking" |
| Tavern | "lively tavern music, folk instruments, cheerful, drinking songs" |
| Temple | "sacred temple music, choir, reverent, ancient mystical" |
| Marketplace | "bustling market music, lively, diverse instruments, busy atmosphere" |

### Emotional Moments
| Moment | Music Prompt |
|--------|--------------|
| Sad Scene | "emotional sad music, piano, strings, heartbreak, loss" |
| Romance | "romantic theme, gentle strings, tender, love story" |
| Mystery | "mysterious investigation music, subtle tension, curious, detective" |
| Horror | "creepy horror music, dissonant, unsettling, fear, dread" |
| Hope | "hopeful inspiring music, uplifting melody, new beginning, dawn" |

### Menu & UI
| Screen | Music Prompt |
|--------|--------------|
| Main Menu | "epic main menu theme, memorable melody, sets the tone, cinematic" |
| Character Select | "character selection music, anticipation, heroic undertones" |
| Credits | "end credits music, reflective, journey complete, emotional payoff" |
| Loading | "ambient loading music, subtle, non-intrusive, atmospheric" |

## Duration Guidelines

- **Jingles/Stingers**: 5-10 seconds (victory, level up, item get)
- **Short loops**: 30-60 seconds (menu, loading)
- **Scene music**: 60-180 seconds (exploration, combat)
- **Cinematic**: 120-300 seconds (cutscenes, boss intros)

## Tool Call Patterns

### Quick Music Generation
```
Tool: compose_music
- prompt: [scene-appropriate prompt from tables]
- music_length_ms: [duration in milliseconds]
```

### Complex/Structured Music
```
Tool: create_composition_plan
- prompt: [detailed music description]
- music_length_ms: [target duration]

Then:
Tool: compose_music
- composition_plan: [returned plan]
```

## Example Translations

**User**: "I need music for when the player enters a spooky haunted mansion"
**Action**: `compose_music` with:
- prompt: "haunted mansion music, creepy piano, ghostly atmosphere, Victorian horror, unsettling melody with music box elements"
- music_length_ms: 120000

**User**: "Epic final boss theme"
**Action**: 
1. `create_composition_plan` with:
   - prompt: "epic final boss battle theme, full orchestra, dramatic choir, intense percussion, phases building from ominous to climactic, memorable villain motif"
   - music_length_ms: 180000
2. `compose_music` with returned plan

**User**: "Quick victory jingle when player wins"
**Action**: `compose_music` with:
- prompt: "short victory fanfare, triumphant brass, celebratory, achievement unlocked feeling"
- music_length_ms: 5000

**User**: "Peaceful fishing minigame music"
**Action**: `compose_music` with:
- prompt: "relaxing fishing music, gentle acoustic guitar, calm water sounds, peaceful afternoon, no rush"
- music_length_ms: 90000
