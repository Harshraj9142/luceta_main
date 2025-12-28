#!/usr/bin/env python3
"""
LLM Analyzer Workflow Test
Tests the full workflow: Code Analysis -> Groq API -> Parse Response
"""

import json
import urllib.request
import re
from pathlib import Path

def load_api_key():
    """Load Groq API key from .env file"""
    env_path = Path(__file__).parent.parent.parent.parent / '.env'
    if not env_path.exists():
        print(f"ERROR: .env file not found at {env_path}")
        return None
    
    content = env_path.read_text()
    for line in content.split('\n'):
        if 'GROQ_API_KEY' in line:
            # Handle both formats: KEY="value" and KEY='value'
            match = re.search(r'["\']([^"\']+)["\']', line)
            if match:
                return match.group(1)
    return None

def simulate_code_analysis():
    """Simulated code analysis results (what CodeAnalyzer would return)"""
    return {
        'events': [
            {
                'name': '_p_walking', 
                'sound_hint': 'footstep', 
                'context': 'Player walking function with movement vectors and sprite animation'
            },
            {
                'name': '_p_chopping', 
                'sound_hint': 'attack', 
                'context': 'Player chopping trees, plays animation on frame 6'
            },
            {
                'name': '_on_sprite_2d_frame_changed',
                'sound_hint': 'generic',
                'context': 'Frame change handler for chopping animation sounds'
            }
        ],
        'actions': [
            {'name': 'WALKING', 'sound_hint': 'footstep'},
            {'name': 'CHOPPING', 'sound_hint': 'attack'}
        ],
        'interactions': [
            {'type': 'collision', 'sound_hint': 'interaction'}
        ],
        'dialogs': []
    }

def build_prompt(code_results):
    """Build LLM prompt (same logic as dock.gd)"""
    prompt = """You are analyzing a Godot game project to suggest sound effects.

Based on the code analysis, here are the detected game events and actions:

EVENTS:
"""
    for event in code_results.get('events', []):
        prompt += f"- {event['name']} ({event['sound_hint']}): {event['context']}\n"
    
    prompt += "\nACTIONS:\n"
    for action in code_results.get('actions', []):
        prompt += f"- {action['name']} ({action['sound_hint']})\n"
    
    prompt += "\nINTERACTIONS:\n"
    for interaction in code_results.get('interactions', []):
        prompt += f"- {interaction['type']} ({interaction['sound_hint']})\n"
    
    prompt += """
Based on this analysis, provide a JSON object with a key "fx" containing an array of sound effect suggestions.
Each suggestion should have:
- "name": unique identifier (e.g., "player_footstep", "coin_collect")
- "description": detailed description of how the sound should sound
- "why": explanation of why this sound is needed
- "context": the game event/action this sound is for

Respond with ONLY valid JSON, no markdown formatting. Example format:
{"fx": [{"name": "player_footstep", "description": "soft grass footstep sound, 0.2s duration", "why": "player walks on grass", "context": "_p_walking function"}]}
"""
    return prompt

def call_groq_api(api_key, prompt):
    """Call Groq API with the prompt using the groq SDK"""
    import os
    os.environ['GROQ_API_KEY'] = api_key
    
    from groq import Groq
    
    client = Groq()
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_completion_tokens=4096,
        top_p=0.95,
        reasoning_effort="medium",
        stream=False
    )
    
    # Convert to dict format expected by parse function
    return {
        'choices': [{
            'message': {
                'content': completion.choices[0].message.content
            }
        }]
    }

def parse_llm_response(response):
    """Parse LLM response and extract sound suggestions"""
    if 'choices' not in response or len(response['choices']) == 0:
        return None, "No choices in response"
    
    content = response['choices'][0]['message']['content']
    
    # Extract JSON from response (handle markdown wrapping)
    json_start = content.find('{')
    json_end = content.rfind('}')
    
    if json_start < 0 or json_end <= json_start:
        return None, f"Could not find JSON in response: {content[:200]}"
    
    json_str = content[json_start:json_end + 1]
    
    try:
        parsed = json.loads(json_str)
        if 'fx' not in parsed:
            return None, "Response missing 'fx' key"
        return parsed['fx'], None
    except json.JSONDecodeError as e:
        return None, f"JSON parse error: {e}"

def main():
    print("=" * 60)
    print("Agent SFX - LLM Analyzer Workflow Test")
    print("=" * 60)
    
    # Step 1: Load API key
    print("\n[Step 1] Loading API key...")
    api_key = load_api_key()
    if not api_key:
        print("ERROR: Could not load Groq API key from .env")
        return 1
    print(f"API key loaded: {api_key[:15]}...")
    
    # Step 2: Simulate code analysis
    print("\n[Step 2] Simulating code analysis...")
    code_results = simulate_code_analysis()
    print(f"  Events: {len(code_results['events'])}")
    print(f"  Actions: {len(code_results['actions'])}")
    print(f"  Interactions: {len(code_results['interactions'])}")
    
    # Step 3: Build prompt
    print("\n[Step 3] Building LLM prompt...")
    prompt = build_prompt(code_results)
    print(f"  Prompt length: {len(prompt)} characters")
    
    # Step 4: Call Groq API
    print("\n[Step 4] Calling Groq API...")
    print("  Model: openai/gpt-oss-120b")
    print("  Waiting for response...")
    
    try:
        response = call_groq_api(api_key, prompt)
        print("  Response received!")
    except Exception as e:
        print(f"ERROR: API call failed - {e}")
        return 1
    
    # Step 5: Parse response
    print("\n[Step 5] Parsing LLM response...")
    suggestions, error = parse_llm_response(response)
    
    if error:
        print(f"ERROR: {error}")
        return 1
    
    # Display results
    print("\n" + "=" * 60)
    print("SOUND EFFECT SUGGESTIONS")
    print("=" * 60)
    
    for i, fx in enumerate(suggestions, 1):
        print(f"\n{i}. {fx.get('name', 'unnamed')}")
        print(f"   Description: {fx.get('description', 'N/A')}")
        print(f"   Why: {fx.get('why', 'N/A')}")
        print(f"   Context: {fx.get('context', 'N/A')}")
    
    print("\n" + "=" * 60)
    print(f"SUCCESS! Generated {len(suggestions)} sound effect suggestions")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    exit(main())
