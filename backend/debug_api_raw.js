const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing from .env file");
    process.exit(1);
}

console.log(`Key loaded: ${API_KEY.substring(0, 5)}...${API_KEY.slice(-4)}`);

async function testRawAPI() {
    try {
        console.log("Attempting to list models via raw REST API...");
        // This is the standard endpoint to list models
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

        const response = await axios.get(url);

        console.log("✅ SUCCESS: API Key is working!");
        console.log("Available Models:");
        const models = response.data.models || [];
        models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(` - ${m.name}`);
            }
        });

        console.log("\nAttempting RAW Generation with models/gemini-2.5-flash...");
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        const payload = {
            contents: [{
                parts: [{ text: "Hello, explain 2.5 flash briefly." }]
            }]
        };

        const genResponse = await axios.post(genUrl, payload);
        console.log("✅ RAW GENERATION SUCCESS!");
        console.log(JSON.stringify(genResponse.data, null, 2));

    } catch (error) {
        console.error("❌ FAILED: Raw API Request Failed");
        if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error("Error Body:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testRawAPI();
