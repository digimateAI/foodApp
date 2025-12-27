const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModel(modelName) {
    console.log(`Checking model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        console.log(`✅ SUCCESS: ${modelName} responded.`);
        console.log(`Response: ${result.response.text()}\n`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: ${modelName}`);
        console.error(`Error: ${error.status} ${error.statusText}`);
        // console.error(error);
        console.log('\n');
        return false;
    }
}

async function runDiagnostics() {
    console.log("--- Starting API Diagnostics ---\n");

    await checkModel("gemini-1.5-flash");
    await checkModel("gemini-1.5-pro");
    await checkModel("gemini-pro");

    console.log("--- End Diagnostics ---");
}

runDiagnostics();
