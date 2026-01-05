import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { db, bucket } from '../config/firebase';

const prisma = new PrismaClient();

// Get Meals for a Date
export const getMeals = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { date } = req.query; // YYYY-MM-DD

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Parse date ensuring it matches the stored format/timezone logic
        // For simplicity, we assume the date passed is the local date string
        // and we query based on that string if we stored it as string, 
        // but in schema it is DateTime. 
        // Let's filter by range for that day.
        const startOfDay = new Date(date as string);
        const endOfDay = new Date(date as string);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const meals = await prisma.meal.findMany({
            where: {
                userId,
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            include: { items: { include: { food: true } }, photo: true }
        });

        res.json(meals);
    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Log a Meal (Manual)
// Log a Meal (Manual or AI with Image)
export const logMeal = [
    // Middleware to handle upload inside the specific route is usually better, 
    // but here we are modifying the controller. The router presumably assigns the upload middleware.
    // However, the router def for logMeal currently does NOT have upload middleware.
    // I will need to update the ROUTE for logMeal in step 46 or so, but let's update controller first.
    // Wait, if I don't use the upload wrapper here, req.file won't exist. 
    // So I assume step 4 will fix the route.
    async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.userId || 'demo-user-123';

            let mealData;
            if (req.is('multipart/form-data')) {
                if (req.body.data) {
                    mealData = JSON.parse(req.body.data);
                } else {
                    mealData = req.body;
                }
            } else {
                mealData = req.body;
            }

            const { date, type, items } = mealData;

            let publicUrl = null;
            if (req.file) {
                const timestamp = Date.now();
                const filename = `food_log_${userId}_${timestamp}.jpg`;
                const file = bucket.file(filename);

                await file.save(req.file.buffer, {
                    contentType: req.file.mimetype,
                    metadata: { contentType: req.file.mimetype }
                });
                await file.makePublic();
                // Ensure bucket name is correct in URL
                publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            }

            // Construct Firestore Document
            const mealDoc = {
                userId,
                date: new Date(date).toISOString(), // Firestore prefers ISO strings or Timestamps
                type,
                items: items, // Save items array directly (No relational table needed)
                photoUrl: publicUrl,
                createdAt: new Date().toISOString()
            };

            // Save to Firestore 'meals' collection
            const docRef = await db.collection('meals').add(mealDoc);

            res.json({ id: docRef.id, ...mealDoc });

        } catch (error: any) {
            console.error('Log meal error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
];

// Search Food
export const searchFood = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        const foods = await prisma.food.findMany({
            where: {
                name: {
                    contains: q as string,
                    mode: 'insensitive'
                }
            },
            take: 20
        });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Analyze Food Image (Gemini Only - No Upload)
export const analyzeFood = async (req: Request | any, res: Response) => {
    console.log('--- analyzeFood request received ---');
    try {
        if (!req.file) {
            console.log('Error: No image file provided');
            return res.status(400).json({ error: 'No image file provided' });
        }
        console.log(`Image received. Size: ${req.file.size} bytes, Mime: ${req.file.mimetype}`);

        const apiKey = process.env.GEMINI_API_KEY;
        // console.log('API Key present:', !!apiKey); // Security: don't log key
        const modelName = "models/gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

        // ... prompt setup ...
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

        console.log('Sending request to Gemini...');
        console.time('Gemini Analysis');
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // Add explicit timeout for backend call to Gemini
        });
        console.timeEnd('Gemini Analysis');
        console.log('Gemini response received.');

        const candidates = response.data.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("No candidates returned from Gemini");
        }

        const rawText = candidates[0].content.parts[0].text;
        const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Sanitize numbers
        const validItems = data.items.map((i: any) => ({
            ...i,
            calories: Number(i.calories) || 0,
            protein_g: Number(i.protein_g) || 0,
            carbs_g: Number(i.carbs_g) || 0,
            fat_g: Number(i.fat_g) || 0
        }));

        const cleanData = {
            ...data,
            items: validItems,
            total_calories: Number(data.total_calories) || 0,
            total_protein_g: Number(data.total_protein_g) || 0,
            total_carbs_g: Number(data.total_carbs_g) || 0,
            total_fat_g: Number(data.total_fat_g) || 0
        };

        res.json(cleanData);

    } catch (error: any) {
        console.error('Analyze food error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
