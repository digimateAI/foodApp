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
export const logMeal = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { date, type, items } = req.body; // items: { foodId, quantity }[]

        const meal = await prisma.meal.create({
            data: {
                userId,
                date: new Date(date),
                type,
                items: {
                    create: items.map((item: any) => ({
                        foodId: item.foodId,
                        quantity: item.quantity,
                        calories: item.calories, // Should calculate from food * quantity
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat
                    }))
                }
            },
            include: { items: true }
        });

        res.json(meal);
    } catch (error) {
        console.error('Log meal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

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


// Analyze Food Image (Gemini)
export const analyzeFood = async (req: Request | any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = "models/gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

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

        // -------------------------

        console.time('Gemini Analysis');
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.timeEnd('Gemini Analysis');

        const candidates = response.data.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("No candidates returned from Gemini");
        }

        const rawText = candidates[0].content.parts[0].text;
        const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        const validItems = data.items.map((i: any) => ({
            ...i,
            calories: Number(i.calories) || 0,
            protein_g: Number(i.protein_g) || 0,
            carbs_g: Number(i.carbs_g) || 0,
            fat_g: Number(i.fat_g) || 0
        }));

        // --- Save to Firebase Storage ---
        const timestamp = Date.now();
        const filename = `food_${timestamp}.jpg`;
        const file = bucket.file(filename);

        console.time('Storage Upload');
        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            metadata: {
                contentType: req.file.mimetype
            }
        });

        // Make the file public
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        console.log('Image uploaded to:', publicUrl);
        console.timeEnd('Storage Upload');
        // ---------------------------

        // --- Save to Firestore (Admin SDK) ---
        try {
            console.time('Firestore Save');

            // Note: Admin SDK handles types automatically!
            const docRef = await db.collection('food_details').add({
                timestamp: new Date().toISOString(),
                image_url: publicUrl,
                ...data, // spread the gemini response
                items: validItems // overwrite items with cleaned numbers
            });

            console.log('Successfully saved to Firestore with ID:', docRef.id);
            console.timeEnd('Firestore Save');

        } catch (firestoreError: any) {
            console.error('Failed to save to Firestore:', firestoreError.message);
        }
        // -------------------------

        res.json(data);

    } catch (error: any) {
        console.error('Analyze food error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
