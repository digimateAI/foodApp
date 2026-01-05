const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking models with key: ${apiKey ? 'PRESENT' : 'MISSING'}`);

axios.get(url)
    .then(response => {
        console.log('Available Models:');
        const models = response.data.models;
        models.forEach(m => {
            if (m.name.includes('gemini') || m.name.includes('flash')) {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching models:', error.response ? error.response.data : error.message);
    });
