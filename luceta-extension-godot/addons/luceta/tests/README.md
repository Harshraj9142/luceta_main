# Agent SFX Test Suite

Automated test scripts for end-to-end testing of the Agent SFX addon.

## Available Tests

### 1. `test_runner.gd` - Unit Tests
**Purpose**: Tests individual components without making API calls

**Run**: Editor → Run Script → Select `test_runner.gd`

**Tests**:
- Code Analyzer functionality
- LLM Analyzer setup
- ElevenLabs Generator setup
- Audio Cache functionality
- API key configuration
- Component integration

**Duration**: ~10 seconds (no API calls)

### 2. `test_api_integration.gd` - API Integration Tests
**Purpose**: Tests actual API calls to Groq and ElevenLabs

**Run**: Editor → Run Script → Select `test_api_integration.gd`

**Tests**:
- Groq AI API connectivity
- Response parsing
- ElevenLabs API connectivity (optional)

**Duration**: ~5-10 seconds per API call

**⚠️ WARNING**: This makes real API calls and may consume credits!

### 3. `test_end_to_end.gd` - Full Workflow Test
**Purpose**: Tests the complete workflow from code analysis to audio generation

**Run**: Editor → Run Script → Select `test_end_to_end.gd`

**Tests**:
- Code analysis
- LLM suggestions (Groq)
- Audio generation (ElevenLabs, if key available)
- File saving and verification

**Duration**: ~15-30 seconds

**⚠️ WARNING**: This makes real API calls and will consume credits!

## How to Run Tests

### Method 1: Via Editor Menu
1. Open Godot Editor
2. Go to **Editor → Run Script**
3. Select the test file you want to run
4. Click **Run**
5. Check Output panel for results

### Method 2: Via Command Line (if available)
```bash
godot --script addons/agent-sfx/tests/test_runner.gd
```

## Test Results

### Success Indicators:
- ✅ All tests show "PASS"
- ✅ No error messages
- ✅ Files are created correctly
- ✅ API responses are valid

### Failure Indicators:
- ❌ Tests show "FAIL"
- ❌ Error messages in output
- ❌ API errors (401, 403, 429, etc.)
- ❌ Files not created

## Interpreting Results

### test_runner.gd Results:
```
Tests Passed: 15
Tests Failed: 0
✅ ALL TESTS PASSED!
```
**Meaning**: All components are working correctly

### test_api_integration.gd Results:
```
✅ PASS: Groq API responded successfully
✅ PASS: Response contains valid JSON
```
**Meaning**: API integration is working

### test_end_to_end.gd Results:
```
✅ Code Analysis
✅ LLM Analysis
✅ Audio Generation
✅ File Verification
🎉 ALL STEPS PASSED!
```
**Meaning**: Complete workflow is functional

## Troubleshooting

### "API key not found"
**Fix**: Set API keys in Project Settings or create key files

### "API returned error code: 401"
**Fix**: API key is invalid or expired

### "API returned error code: 429"
**Fix**: Rate limit exceeded, wait a few minutes

### "Failed to send request"
**Fix**: Check internet connection

### "File not found"
**Fix**: Check write permissions on project directory

## Test Coverage

### ✅ Covered:
- Code analysis
- LLM integration
- Audio generation
- File operations
- Caching
- Error handling

### ⚠️ Not Covered (Manual Testing):
- UI interactions
- Preview functionality
- Auto-wiring
- User workflow

## Running All Tests

To run all tests in sequence:

1. **First**: Run `test_runner.gd` (fast, no API calls)
2. **Second**: Run `test_api_integration.gd` (tests APIs)
3. **Third**: Run `test_end_to_end.gd` (full workflow)

## Continuous Testing

For development, run `test_runner.gd` frequently as it:
- Runs quickly
- Doesn't consume API credits
- Catches code issues early

Save API tests for:
- Before releases
- After major changes
- When debugging API issues

## Adding New Tests

To add a new test:

1. Create a new test function in the appropriate file
2. Use `assert_true()`, `assert_false()`, etc.
3. Follow the existing test patterns
4. Document what the test does

Example:
```gdscript
func test_new_feature():
    var feature = NewFeature.new()
    assert_not_null(feature, "NewFeature can be instantiated")
    assert_true(feature.is_working(), "NewFeature works correctly")
```


