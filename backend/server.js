const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const { GoogleGenerativeAI } = require('@google/generative-ai'); // Consistently failing with SDK
const axios = require('axios');
const multer = require('multer');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.send('FoodVision Backend is running');
});

app.post('/analyze-food', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload Error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ error: `Server Error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = "models/gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

        console.log(`Sending request to Gemini (${modelName}) via RAW API...`);

        const promptText = `
          Analyze this image and identify the food items present.
          For each item, estimate the calories and macros (protein, carbs, fat) for the serving size shown.
          Return the result as a JSON object with the following structure:
          {
            "items": [
              {
                "name": "Food Name",
                "calories": 100,
                "protein_g": 10,
                "carbs_g": 20,
                "fat_g": 5,
                "confidence": 0.95
              }
            ],
            "total_calories": 0,
            "total_protein_g": 0,
            "total_carbs_g": 0,
            "total_fat_g": 0
          }
          Ensure the output is strictly valid JSON with no markdown formatting.
        `;

        const payload = {
            contents: [
                {
                    parts: [
                        { text: promptText },
                        {
                            inline_data: {
                                mime_type: req.file.mimetype,
                                data: req.file.buffer.toString('base64')
                            }
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Parse result
        const candidates = response.data.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("No candidates returned from Gemini");
        }

        const rawText = candidates[0].content.parts[0].text;

        // Clean up markdown code blocks if present (Gemini loves markdown)
        const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", rawText);
            throw new Error("Invalid JSON response from Gemini");
        }

        res.json(data);

    } catch (error) {
        let errorMsg = error.message;
        let errorDetails = error.toString();

        if (error.response) {
            // Axios error
            errorMsg = `Gemini API Error: ${error.response.status} ${error.response.statusText}`;
            errorDetails = JSON.stringify(error.response.data);
            console.error('FULL ERROR RESPONSE:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('FULL ERROR:', error);
        }

        res.status(500).json({
            error: errorMsg,
            details: errorDetails
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
