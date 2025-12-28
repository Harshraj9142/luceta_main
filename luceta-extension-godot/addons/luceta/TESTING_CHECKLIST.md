# End-to-End Testing Checklist

## Pre-Test Setup ✅

### 1. API Keys Configuration
- [ ] Groq API key set in Project Settings → `agent_sfx/groq_api_key`
  - OR `res://GROQ_API_KEY.txt` file exists
- [ ] ElevenLabs API key set in Project Settings → `agent_sfx/elevenlabs_api_key`
  - OR `res://ELEVEN_LABS_API_KEY.txt` file exists
- [ ] Verify keys are valid (not empty, correct format)

### 2. Plugin Activation
- [ ] Plugin is enabled in Project → Project Settings → Plugins
- [ ] Agent SFX dock appears in the editor (left side)
- [ ] No errors in Godot's Output panel

## Test Flow 1: Code Analysis → LLM Suggestions

### Step 1: Code Analysis
1. [ ] Click "Analyze Code" button
2. [ ] Progress bar appears and shows progress
3. [ ] Progress label shows "Analyzing code..."
4. [ ] Code analysis completes (check Output panel for any errors)
5. [ ] Progress label updates to "Code analysis complete. Querying LLM..."

**Expected Results:**
- No errors in Output panel
- Analysis finds `.gd` files in project
- Analysis finds `.tscn` files in project
- Events, actions, interactions detected

### Step 2: LLM Analysis (Groq AI)
1. [ ] Progress label shows "Code analysis complete. Querying LLM..."
2. [ ] Wait for Groq API response (usually 2-5 seconds)
3. [ ] Progress label updates to "Review and edit suggestions..."
4. [ ] Review panel appears with suggestions

**Expected Results:**
- No API errors
- Suggestions array is populated
- Each suggestion has: name, description, why, context
- Review panel shows all suggestions

**Common Issues:**
- ❌ "Error: Groq API key not set!" → Check API key configuration
- ❌ "Error: API request failed" → Check internet connection, API key validity
- ❌ "Error: Invalid JSON response" → Check Groq API status

## Test Flow 2: Review & Edit Suggestions

### Step 1: Review Panel
1. [ ] Review panel is visible
2. [ ] Suggestions list shows all generated suggestions
3. [ ] Each suggestion has editable fields:
   - [ ] Name field (LineEdit)
   - [ ] Description field (TextEdit)
   - [ ] Why field (TextEdit)
   - [ ] Context label (read-only, gray)
   - [ ] Status label (shows "Not generated yet")
   - [ ] Preview button (disabled, shows "Not generated")
   - [ ] Remove button

### Step 2: Edit Suggestions
1. [ ] Edit a suggestion name → Changes save correctly
2. [ ] Edit a suggestion description → Changes save correctly
3. [ ] Edit a suggestion "why" → Changes save correctly
4. [ ] Click "Remove" on a suggestion → Suggestion is removed, list refreshes

**Expected Results:**
- All edits persist
- UI updates immediately
- No errors when editing

## Test Flow 3: Audio Generation (ElevenLabs)

### Step 1: Generate Audio
1. [ ] Click "Generate Audio Files" button
2. [ ] Button becomes disabled
3. [ ] Progress bar appears and shows progress
4. [ ] Progress label shows "Generating: [sound_name]"
5. [ ] Progress bar updates for each sound

**Expected Results:**
- Progress bar shows 0/N, 1/N, 2/N, etc.
- Each sound generates successfully
- No API errors

### Step 2: Verify Generated Files
1. [ ] Check `res://agent_sfx_generated/` directory exists
2. [ ] Sound effects saved to root directory
3. [ ] Dialog files saved to `res://agent_sfx_generated/dialog/`
4. [ ] Music files saved to `res://agent_sfx_generated/music/` (if any)
5. [ ] Files are `.mp3` format
6. [ ] Files are imported by Godot (visible in FileSystem)

**Expected Results:**
- All files created successfully
- Files are valid audio files
- Godot recognizes them as AudioStream resources

### Step 3: Preview Audio
1. [ ] After generation, Preview buttons become enabled
2. [ ] Click "Preview" on a generated sound
3. [ ] Audio plays in editor
4. [ ] Audio stops after playback
5. [ ] Status label shows "✓ Generated: [file_path]"

**Expected Results:**
- Preview works for all generated sounds
- Audio quality is acceptable
- No errors during playback

**Common Issues:**
- ❌ "Error generating [sound]: API returned error code: 401" → Invalid ElevenLabs API key
- ❌ "Error generating [sound]: API returned error code: 429" → Rate limit exceeded
- ❌ "Failed to open file for writing" → Permission issue, check directory

## Test Flow 4: Auto-Wiring

### Step 1: Auto-Wiring Prompt
1. [ ] After generation completes, dialog appears: "Auto-Wire Sounds?"
2. [ ] Click "Yes"
3. [ ] Progress label shows "Auto-wiring sounds to game events..."
4. [ ] Wiring instructions file created

### Step 2: Verify Wiring Data
1. [ ] Check `res://agent_sfx_generated/wiring_instructions.gd` exists
2. [ ] File contains wiring data structure
3. [ ] Each sound has mapping to code context

**Expected Results:**
- Wiring file created successfully
- Contains valid JSON/GDScript data
- Mappings are logical

## Test Flow 5: Caching

### Step 1: Second Analysis
1. [ ] Run "Analyze Code" again (without changing code)
2. [ ] Progress label shows "Using cached analysis..."
3. [ ] Analysis completes instantly (no code scanning)
4. [ ] Results are identical to first run

**Expected Results:**
- Cache is used (faster)
- Results are same as before
- Cache stored in `.godot/agent_sfx_cache/`

### Step 2: Cache Invalidation
1. [ ] Modify a `.gd` file (add a comment)
2. [ ] Run "Analyze Code" again
3. [ ] Cache is invalidated (full analysis runs)
4. [ ] New cache is saved

**Expected Results:**
- Cache detects file changes
- Full analysis runs
- New cache saved

## Error Handling Tests

### Test 1: Missing API Keys
1. [ ] Remove Groq API key
2. [ ] Click "Analyze Code"
3. [ ] Error message: "Error: Groq API key not set!"

### Test 2: Invalid API Keys
1. [ ] Set invalid Groq API key
2. [ ] Click "Analyze Code"
3. [ ] Error message shows API failure (401/403)

### Test 3: Network Issues
1. [ ] Disconnect internet
2. [ ] Click "Analyze Code"
3. [ ] Error message shows connection failure

### Test 4: Empty Project
1. [ ] Test with minimal project (no .gd files)
2. [ ] Click "Analyze Code"
3. [ ] Analysis completes but finds no events
4. [ ] LLM still provides suggestions (based on project type)

## Performance Tests

### Test 1: Large Project
1. [ ] Test with project containing 50+ .gd files
2. [ ] Analysis completes in reasonable time (<30 seconds)
3. [ ] No memory issues

### Test 2: Batch Generation
1. [ ] Generate 10+ sounds at once
2. [ ] All sounds generate successfully
3. [ ] Progress tracking works correctly
4. [ ] No timeouts or rate limit issues

## Integration Tests

### Test 1: Full Workflow
1. [ ] Complete workflow: Analyze → Review → Generate → Preview
2. [ ] All steps complete without errors
3. [ ] Generated files are usable in Godot

### Test 2: Multiple Runs
1. [ ] Run full workflow 3 times
2. [ ] Each run completes successfully
3. [ ] No memory leaks or errors

## Success Criteria ✅

All tests pass if:
- ✅ Code analysis works correctly
- ✅ Groq AI integration works (gets suggestions)
- ✅ ElevenLabs integration works (generates audio)
- ✅ Files are saved correctly
- ✅ Preview works
- ✅ Caching works
- ✅ Error handling is graceful
- ✅ UI is responsive

## Known Limitations

- Music API not yet available (placeholder ready)
- Auto-wiring requires manual integration
- Cache based on file modification time (not content hash)

## Debugging Tips

1. **Check Output Panel**: All errors/logs appear here
2. **Check API Keys**: Verify in Project Settings
3. **Check Network**: Ensure internet connection
4. **Check File Permissions**: Ensure write access to project directory
5. **Check API Status**: Verify Groq/ElevenLabs APIs are operational

## Reporting Issues

If tests fail, note:
- Which test failed
- Error message from Output panel
- API response codes (if any)
- Steps to reproduce

