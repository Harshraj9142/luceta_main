const API_KEY = "sk_5b1d95fd4044286f819e05ecf32845e3de74cc3c58fa302b";

const url = "https://api.elevenlabs.io/v1/sound-generation";

const data = {
    text: "short bouncy jump sound effect",
    duration_seconds: 1.0,
    prompt_influence: 0.3
};

console.log("Testing ElevenLabs API...");
console.log("URL:", url);
console.log("API Key:", API_KEY.slice(0, 10) + "..." + API_KEY.slice(-5));

fetch(url, {
    method: "POST",
    headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(async response => {
    console.log("\nStatus Code:", response.status);
    
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        const fs = require('fs');
        fs.writeFileSync('test_sound.mp3', Buffer.from(buffer));
        console.log("Success! Audio saved to test_sound.mp3");
    } else {
        const errorText = await response.text();
        console.log("Error:", errorText);
    }
})
.catch(error => {
    console.log("Request failed:", error.message);
});
