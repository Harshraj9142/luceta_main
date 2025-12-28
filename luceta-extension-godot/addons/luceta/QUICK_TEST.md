# Quick End-to-End Test Guide

## 🚀 Fast Test (5 minutes)

### Step 1: Verify Setup (30 seconds)
1. Open Godot project
2. Check **Project → Project Settings → Plugins** → Agent SFX is **enabled**
3. Check **Project → Project Settings → General → Agent SFX**:
   - `groq_api_key` is set ✅
   - `elevenlabs_api_key` is set ✅
4. Open the **Agent SFX** dock (should be visible on left side)

### Step 2: Run Analysis (2 minutes)
1. Click **"Analyze Code"** button
2. Watch progress:
   - ✅ "Analyzing code..." (should take 5-10 seconds)
   - ✅ "Code analysis complete. Querying LLM..." (should take 2-5 seconds)
   - ✅ "Review and edit suggestions..." (review panel appears)

**✅ Success if:** Review panel shows suggestions with names, descriptions, and "why" fields

**❌ Failure if:** Error message appears - check Output panel for details

### Step 3: Generate Audio (2 minutes)
1. In review panel, you can edit suggestions (optional)
2. Click **"Generate Audio Files"** button
3. Watch progress:
   - ✅ Progress bar shows 1/N, 2/N, etc.
   - ✅ "Generating: [sound_name]" updates for each sound
   - ✅ "✓ Generated X audio files!" when complete

**✅ Success if:** 
- Progress completes
- Files appear in `res://agent_sfx_generated/`
- Preview buttons become enabled

**❌ Failure if:** 
- Error messages appear
- Check Output panel for API errors

### Step 4: Test Preview (30 seconds)
1. Click **"Preview"** button on any generated sound
2. Audio should play in editor
3. Status shows "✓ Generated: [path]"

**✅ Success if:** Audio plays correctly

## 🔍 What to Check

### In Godot Editor:
- **Output Panel**: Check for any errors (red text)
- **FileSystem**: Check `agent_sfx_generated/` folder exists
- **Progress Bar**: Should update smoothly
- **UI Elements**: All buttons should be responsive

### Generated Files:
- Location: `res://agent_sfx_generated/`
- Format: `.mp3` files
- Organization:
  - Sound effects: root directory
  - Dialog: `dialog/` subdirectory
  - Music: `music/` subdirectory (if any)

## 🐛 Common Issues & Fixes

### Issue: "Error: Groq API key not set!"
**Fix:** 
- Go to Project Settings → Agent SFX → Set `groq_api_key`
- OR create `res://GROQ_API_KEY.txt` with your key

### Issue: "Error: API request failed (code 401)"
**Fix:** 
- API key is invalid or expired
- Get new key from https://console.groq.com (Groq) or https://elevenlabs.io (ElevenLabs)

### Issue: "Error: Invalid JSON response"
**Fix:** 
- Groq API might be down or rate-limited
- Check Groq status page
- Wait a few minutes and retry

### Issue: "Failed to open file for writing"
**Fix:** 
- Check file permissions on project directory
- Ensure project is not read-only
- Check disk space

### Issue: Preview doesn't work
**Fix:** 
- Ensure audio file was generated successfully
- Check file exists in FileSystem
- Try regenerating the sound

## 📊 Expected Results

### Code Analysis:
- Finds functions like `_p_walking`, `_on_area_entered`, etc.
- Detects state machines (`enum STATE`)
- Finds dialog nodes (RichTextLabel)
- Detects signal connections

### LLM Suggestions:
- 5-15 sound suggestions (depends on code complexity)
- Each has: name, description, why, context
- Suggestions are relevant to your game code

### Generated Audio:
- All sounds generate successfully
- Files are valid MP3 format
- Can be previewed in editor
- Can be used in Godot scenes

## ✅ Success Criteria

**System is working if:**
1. ✅ Code analysis completes without errors
2. ✅ LLM provides suggestions (Groq API works)
3. ✅ Audio generation works (ElevenLabs API works)
4. ✅ Files are saved correctly
5. ✅ Preview works
6. ✅ No crashes or freezes

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ System is ready for production use
2. ✅ You can now use it on your game projects
3. ✅ Generated sounds can be integrated into your game

If tests fail:
1. Check error messages in Output panel
2. Verify API keys are correct
3. Check internet connection
4. Review TESTING_CHECKLIST.md for detailed debugging

## 📝 Test Log Template

```
Date: ___________
Groq API Key: [ ] Set [ ] Not Set
ElevenLabs API Key: [ ] Set [ ] Not Set

Code Analysis: [ ] Pass [ ] Fail
LLM Suggestions: [ ] Pass [ ] Fail  
Audio Generation: [ ] Pass [ ] Fail
Preview: [ ] Pass [ ] Fail

Issues Found:
_______________________________________
_______________________________________
_______________________________________

Notes:
_______________________________________
_______________________________________
```


