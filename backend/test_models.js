const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent("Hello");
        // Wait, listModels is a method on the client/manager usually, but standard SDK usage often implies knowing the model.
        // Actually, there isn't a direct "listModels" method exposed in the simplest 'GoogleGenerativeAI' class instance in some versions?
        // Let's check documentation memory: It's typically strictly `genAI.getGenerativeModel`...
        // But there is a `makeRequest` or similar? No.

        // Let's try to just hit a known model "gemini-pro" which is usually available.
        // If that fails, maybe the API Key is invalid or has no access.

        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        console.log("gemini-pro success:", result.response.text());

        console.log("Testing gemini-2.5-flash...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result2 = await model2.generateContent("Test");
        console.log("gemini-2.5-flash success:", result2.response.text());

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
