#!/usr/bin/env python3
"""
ElevenLabs Audio Generation Test
Tests the sound effect generation using ElevenLabs API
"""
import os
import re
import json
import urllib.request
from pathlib import Path

# Load ElevenLabs API key from .env
env_path = Path(__file__).parent.parent.parent.parent / '.env'
content = env_path.read_text()
elevenlabs_key = None
for line in content.split('\n'):
    if 'ELEVEN_LABS_API_KEY' in line:
        match = re.search(r'["\'](sk_[^"\']+)["\']', line)
        if match:
            elevenlabs_key = match.group(1)
            print(f"ElevenLabs API key loaded: {elevenlabs_key[:15]}...")
            break

if not elevenlabs_key:
    print("ERROR: Could not find ELEVEN_LABS_API_KEY in .env")
    exit(1)

# Test sound effect description (from LLM suggestions)
sound_data = {
    "name": "test_footstep",
    "description": "A light, crisp footstep on grass with a subtle rustle, about 0.2 seconds long"
}

print(f"\nGenerating sound effect: {sound_data['name']}")
print(f"Description: {sound_data['description']}")

# Call ElevenLabs Sound Generation API
url = "https://api.elevenlabs.io/v1/sound-generation"
headers = {
    "xi-api-key": elevenlabs_key,
    "Content-Type": "application/json"
}

request_data = {
    "text": f"video game sound effect: {sound_data['description']}",
    "duration_seconds": 0.5,
    "prompt_influence": 0.8
}

print("\nCalling ElevenLabs API...")
print(f"URL: {url}")

try:
    req = urllib.request.Request(url, json.dumps(request_data).encode(), headers)
    with urllib.request.urlopen(req, timeout=60) as response:
        audio_data = response.read()
        
        # Save the audio file
        output_dir = Path(__file__).parent.parent.parent.parent / "agent_sfx_generated"
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / f"{sound_data['name']}.mp3"
        output_file.write_bytes(audio_data)
        
        print(f"\n{'='*50}")
        print("SUCCESS!")
        print(f"{'='*50}")
        print(f"Audio file generated: {output_file}")
        print(f"File size: {len(audio_data)} bytes")
        print(f"\nYou can play this file to hear the generated sound!")

except urllib.error.HTTPError as e:
    print(f"\nERROR: HTTP {e.code}")
    error_body = e.read().decode()
    print(f"Response: {error_body[:500]}")
except Exception as e:
    print(f"\nERROR: {e}")
