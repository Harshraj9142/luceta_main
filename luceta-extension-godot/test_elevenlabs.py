import requests

API_KEY = "sk_5b1d95fd4044286f819e05ecf32845e3de74cc3c58fa302b"

# Test the sound generation endpoint
url = "https://api.elevenlabs.io/v1/sound-generation"

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

data = {
    "text": "short bouncy jump sound effect",
    "duration_seconds": 1.0,
    "prompt_influence": 0.3
}

print(f"Testing ElevenLabs API...")
print(f"URL: {url}")
print(f"API Key: {API_KEY[:10]}...{API_KEY[-5:]}")

response = requests.post(url, headers=headers, json=data)

print(f"\nStatus Code: {response.status_code}")

if response.status_code == 200:
    # Save the audio file
    with open("test_sound.mp3", "wb") as f:
        f.write(response.content)
    print("Success! Audio saved to test_sound.mp3")
else:
    print(f"Error: {response.text}")
