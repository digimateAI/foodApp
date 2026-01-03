import { create } from 'zustand';

export interface Meal {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUri?: string;
    timestamp: number;
}

interface UserProfile {
    name: string;
    gender: 'male' | 'female' | 'other';
    age: string;
    height: string; // stored as string input
    weight: string; // stored as string input
    activityLevel: string; // e.g., 'sedentary', 'active'
    goal: string; // e.g., 'lose_weight'
    dailyCalorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
    bmr: number;
    tdee: number;
}

interface DailyLog {
    meals: Meal[];
    consumedCalories: number;
    consumedProtein: number;
    consumedCarbs: number;
    consumedFat: number;
    waterIntake: number; // in ml
    steps: number;
    sleepDuration: string;
}

interface UserState {
    // Auth
    user: { name: string; email: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    setUser: (user: { name: string; email: string }) => void;
    setToken: (token: string) => void;
    login: () => void;
    logout: () => void;

    // Profile
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    calculateTargets: () => void;

    // Daily Log
    dailyLog: DailyLog;
    logMeal: (meal: Meal) => void;
    resetDailyLog: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    // Auth State
    user: null, // Mock user
    token: null,
    isAuthenticated: false,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token, isAuthenticated: !!token }),
    login: () => set({ token: 'demo-token', isAuthenticated: true }),
    logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        // Optional: clear profile/log on logout?
    }),

    // Profile State (Default Values)
    profile: {
        name: 'Jane Doe',
        gender: 'female',
        age: '28',
        height: '168',
        weight: '62',
        activityLevel: 'moderate',
        goal: 'lose_weight',
        dailyCalorieTarget: 2000,
        proteinTarget: 140,
        carbTarget: 250,
        fatTarget: 70,
        bmr: 1500,
        tdee: 2000,
    },
    updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
    })),

    // Simple mock calculation logic
    // Scientific Calorie Calculation (Mifflin-St Jeor)
    calculateTargets: () => {
        const { age, gender, height, weight, activityLevel, goal } = get().profile;

        // Parse inputs (fallback to defaults if invalid)
        const w = parseFloat(weight) || 70; // kg
        const h = parseFloat(height) || 170; // cm
        const a = parseFloat(age) || 30; // years

        // 1. Calculate BMR
        // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
        // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // 2. Activity Multiplier
        let multiplier = 1.2; // Sedentary default
        switch (activityLevel) {
            case 'Sedentary': multiplier = 1.2; break;
            case 'Lightly Active': multiplier = 1.375; break;
            case 'Moderately Active': multiplier = 1.55; break;
            case 'Very Active': multiplier = 1.725; break;
            case 'Extremely Active': multiplier = 1.9; break;
            // Handle lowercase legacy values if needed
            case 'sedentary': multiplier = 1.2; break;
            case 'light': multiplier = 1.375; break;
            case 'moderate': multiplier = 1.55; break;
            case 'active': multiplier = 1.725; break;
            case 'athlete': multiplier = 1.9; break;
        }

        const tdee = Math.round(bmr * multiplier);

        // 3. Goal Adjustment
        let target = tdee;
        if (goal === 'Weight Loss' || goal === 'lose_weight') target -= 500;
        if (goal === 'Muscle Gain' || goal === 'gain_muscle') target += 300;
        // Maintain Weight = TDEE

        // Safety Bounds (Never recommend dangerous levels without medical advice)
        target = Math.max(1200, Math.round(target));

        // 4. Macro Split (Based on moderate carb balanced diet)
        // Protein: 30%, Carbs: 40%, Fat: 30%
        // 1g Protein = 4kcal, 1g Carb = 4kcal, 1g Fat = 9kcal
        const p = Math.round((target * 0.30) / 4);
        const c = Math.round((target * 0.40) / 4);
        const f = Math.round((target * 0.30) / 9);

        set((state) => ({
            profile: {
                ...state.profile,
                dailyCalorieTarget: target,
                proteinTarget: p,
                carbTarget: c,
                fatTarget: f,
                bmr: Math.round(bmr),
                tdee: Math.round(tdee),
            }
        }));
    },

    // Daily Log State
    dailyLog: {
        meals: [],
        consumedCalories: 0,
        consumedProtein: 0,
        consumedCarbs: 0,
        consumedFat: 0,
        waterIntake: 0,
        steps: 8432, // Mocked live data
        sleepDuration: '7h 20m',
    },

    logMeal: (meal) => set((state) => {
        const newMeals = [...state.dailyLog.meals, meal];
        // Recalculate totals
        const consumedCalories = state.dailyLog.consumedCalories + meal.calories;
        const consumedProtein = state.dailyLog.consumedProtein + meal.protein;
        const consumedCarbs = state.dailyLog.consumedCarbs + meal.carbs;
        const consumedFat = state.dailyLog.consumedFat + meal.fat;

        return {
            dailyLog: {
                ...state.dailyLog,
                meals: newMeals,
                consumedCalories,
                consumedProtein,
                consumedCarbs,
                consumedFat,
            }
        };
    }),

    resetDailyLog: () => set({
        dailyLog: {
            meals: [],
            consumedCalories: 0,
            consumedProtein: 0,
            consumedCarbs: 0,
            consumedFat: 0,
            waterIntake: 0,
            steps: 0,
            sleepDuration: '0h',
        }
    })
}));
