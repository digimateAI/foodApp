import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get User Profile
export const getProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.userId; // Set by auth middleware
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, goals: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Profile
export const updateProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { age, gender, height, weight, activityLevel } = req.body;

        const profile = await prisma.profile.upsert({
            where: { userId },
            update: { age, gender, height, weight, activityLevel },
            create: { userId, age, gender, height, weight, activityLevel }
        });

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Goal
export const updateGoal = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { type, targetWeight, targetDailyCalories, targetProtein, targetCarbs, targetFat } = req.body;

        const goal = await prisma.goal.upsert({
            where: { userId },
            update: { type, targetWeight, targetDailyCalories, targetProtein, targetCarbs, targetFat },
            create: { userId, type, targetWeight, targetDailyCalories, targetProtein, targetCarbs, targetFat }
        });

        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
