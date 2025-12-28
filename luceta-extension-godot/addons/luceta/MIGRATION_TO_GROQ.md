# Migration from FAL.ai to Groq AI

## Changes Made

### 1. LLM Provider Changed
- **Old**: FAL.ai (`https://queue.fal.run/fal-ai/any-llm`)
- **New**: Groq AI (`https://api.groq.com/openai/v1/chat/completions`)

### 2. API Format Changes

#### Old FAL.ai Format:
```json
{
  "prompt": "your prompt here"
}
```

#### New Groq AI Format:
```json
{
  "model": "qwen/qwen2.5-32b-instruct",
  "messages": [
    {
      "role": "user",
      "content": "your prompt here"
    }
  ],
  "temperature": 0.6,
  "max_tokens": 4096,
  "top_p": 0.95
}
```

### 3. Response Format Changes

#### Old FAL.ai Response:
- Queue-based system with polling
- Response in `json.output` or `json.status`

#### New Groq AI Response:
- Direct response (no queue)
- Response in `json.choices[0].message.content`

### 4. Project Settings

**New Setting**:
- `agent_sfx/groq_api_key` - Groq AI API key

**Backward Compatibility**:
- Old `agent_sfx/fal_api_key` setting is still read if Groq key is not set
- Old `FAL_API_KEY.txt` file is still supported

### 5. Default Model

- **Default Model**: `qwen/qwen2.5-32b-instruct`
- Can be changed via `llm_analyzer.set_model()`

## Migration Guide

### For Existing Users

1. **Get Groq API Key**:
   - Visit https://console.groq.com
   - Create an account and get your API key

2. **Update Project Settings**:
   - Go to **Project → Project Settings → General → Agent SFX**
   - Enter your Groq API key in `groq_api_key` field
   - (Old FAL key will still work as fallback)

3. **Or Use File Method**:
   - Create `res://GROQ_API_KEY.txt`
   - Paste your Groq API key

### API Key Location Priority

1. Project Settings: `agent_sfx/groq_api_key`
2. Project Settings: `agent_sfx/fal_api_key` (backward compatibility)
3. File: `res://GROQ_API_KEY.txt`
4. File: `res://FAL_API_KEY.txt` (backward compatibility)

## ElevenLabs Integration

The ElevenLabs integration remains unchanged:
- Text-to-Speech: `POST /v1/text-to-speech/{voice_id}`
- Sound Generation: `POST /v1/sound-generation`
- API format unchanged

## Benefits of Groq AI

- **Faster**: No queue system, direct responses
- **Simpler**: OpenAI-compatible API format
- **Cost-effective**: Competitive pricing
- **Multiple Models**: Access to various models (qwen, llama, mixtral, etc.)

## Code Changes Summary

### Files Modified:
- `llm_analyzer.gd` - Updated to use Groq API
- `dock.gd` - Updated API calls and response parsing
- `plugin.gd` - Added Groq API key setting
- `README.md` - Updated documentation

### Files Unchanged:
- `elevenlabs_generator.gd` - No changes needed
- `code_analyzer.gd` - No changes needed
- `audio_cache.gd` - No changes needed
- `auto_wiring.gd` - No changes needed

## Testing

After migration, test the following:
1. Code analysis should work with Groq API
2. LLM suggestions should be generated
3. Audio generation (ElevenLabs) should still work
4. All features should function normally

## Troubleshooting

### "Error: Groq API key not set!"
- Make sure you've set the API key in Project Settings or file
- Check that the key is valid at https://console.groq.com

### "Error: API request failed"
- Check your internet connection
- Verify API key is correct
- Check Groq API status

### "Error: Unexpected response format"
- This shouldn't happen, but if it does, check Groq API documentation
- Make sure you're using a valid model name


