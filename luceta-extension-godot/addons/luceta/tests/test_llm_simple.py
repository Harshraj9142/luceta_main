#!/usr/bin/env python3
"""Simple LLM test - clean output"""
import os, json, re
from pathlib import Path

# Load API key
env_path = Path(__file__).parent.parent.parent.parent / '.env'
content = env_path.read_text()
for line in content.split('\n'):
    if 'GROQ_API_KEY' in line:
        match = re.search(r'["\'](gsk_[^"\']+)["\']', line)
        if match:
            os.environ['GROQ_API_KEY'] = match.group(1)
            print(f"API key loaded")
            break

from groq import Groq

prompt = '''You are analyzing a Godot game project to suggest sound effects.
EVENTS:
- _p_walking (footstep): Player walking function with movement and animation
- _p_chopping (attack): Player chopping trees with axe animation

ACTIONS:
- WALKING (footstep)
- CHOPPING (attack)

Provide a JSON with key "fx" containing array of 3-4 sound suggestions. 
Each with: name, description, why, context.
Respond with ONLY valid JSON, no markdown formatting.'''

print("Calling Groq API with openai/gpt-oss-120b...")
client = Groq()
completion = client.chat.completions.create(
    model='openai/gpt-oss-120b',
    messages=[{'role': 'user', 'content': prompt}],
    temperature=0.6,
    max_completion_tokens=2048,
    reasoning_effort='medium',
    stream=False
)

content = completion.choices[0].message.content
print("Response received!\n")

# Parse JSON
json_start = content.find('{')
json_end = content.rfind('}')
if json_start >= 0:
    parsed = json.loads(content[json_start:json_end+1])
    print("=" * 50)
    print("SOUND EFFECT SUGGESTIONS")
    print("=" * 50)
    for i, fx in enumerate(parsed.get('fx', []), 1):
        print(f"\n{i}. {fx.get('name', '?')}")
        print(f"   Description: {fx.get('description', '?')}")
        print(f"   Why: {fx.get('why', '?')}")
        print(f"   Context: {fx.get('context', '?')}")
    print("\n" + "=" * 50)
    print(f"SUCCESS: {len(parsed.get('fx', []))} suggestions generated!")
else:
    print("ERROR: Could not parse JSON")
    print(content[:500])
