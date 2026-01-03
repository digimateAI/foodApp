import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    bmi: number;
    bmiStatus: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' | '';
    waterTarget: number; // in ml
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
    hasCompletedOnboarding: boolean;
    setUser: (user: { name: string; email: string }) => void;
    setToken: (token: string) => void;
    login: () => void;
    logout: () => void;
    finishOnboarding: () => void;

    // Profile
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    calculateTargets: () => void;

    // Daily Log
    dailyLog: DailyLog;
    lastActiveDate: string | null;
    logMeal: (meal: Meal) => void;
    addWater: (amount: number) => void;
    resetDailyLog: () => void;
    checkDailyReset: () => void;
}

import { NotificationService } from '../services/NotificationService';

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Auth State
            user: null, // Mock user
            token: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            login: () => set({ token: 'demo-token', isAuthenticated: true, hasCompletedOnboarding: true }),
            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
                hasCompletedOnboarding: false,
                // Optional: clear profile/log on logout?
            }),
            finishOnboarding: () => set({
                isAuthenticated: true,
                hasCompletedOnboarding: true
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
                bmi: 0,
                bmiStatus: '',
                waterTarget: 3000, // Default for female
            },
            updateProfile: (updates) => set((state) => ({
                profile: { ...state.profile, ...updates }
            })),

            // Simple mock calculation logic
            // Scientific Calorie Calculation (Mifflin-St Jeor)
            calculateTargets: () => {
                const { age, gender, height, weight, activityLevel, goal } = get().profile;

                // Parse inputs (fallback to defaults if invalid)
                const w = parseFloat(weight) || 70; // kg - assumes metric for now or converted
                const h = parseFloat(height) || 170; // cm
                const a = parseFloat(age) || 30; // years

                // 1. Calculate BMI
                // BMI = weight (kg) / (height (m))^2
                const heightInMeters = h / 100;
                const bmiValue = heightInMeters > 0 ? w / (heightInMeters * heightInMeters) : 0;
                let bmiStatus: UserProfile['bmiStatus'] = 'Normal';

                if (bmiValue < 18.5) bmiStatus = 'Underweight';
                else if (bmiValue < 25) bmiStatus = 'Normal';
                else if (bmiValue < 30) bmiStatus = 'Overweight';
                else bmiStatus = 'Obese';

                // 2. Calculate BMR
                // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
                // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
                let bmr = (10 * w) + (6.25 * h) - (5 * a);
                if (gender === 'male') {
                    bmr += 5;
                } else {
                    bmr -= 161;
                }

                // 3. Activity Multiplier
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

                // 4. Goal Adjustment
                let target = tdee;
                if (goal === 'Weight Loss' || goal === 'lose_weight') target -= 500;
                if (goal === 'Muscle Gain' || goal === 'gain_muscle') target += 300;
                // Maintain Weight = TDEE

                // Safety Bounds (Never recommend dangerous levels without medical advice)
                target = Math.max(1200, Math.round(target));

                // 5. Macro Split (Based on moderate carb balanced diet)
                // Protein: 30%, Carbs: 40%, Fat: 30%
                // 1g Protein = 4kcal, 1g Carb = 4kcal, 1g Fat = 9kcal
                const p = Math.round((target * 0.30) / 4);
                const c = Math.round((target * 0.40) / 4);
                const f = Math.round((target * 0.30) / 9);

                // 6. Water Calculation (Simplified User Request)
                // Female: 3000ml, Male: 4000ml
                const waterTarget = gender === 'female' ? 3000 : 4000;

                set((state) => ({
                    profile: {
                        ...state.profile,
                        dailyCalorieTarget: target,
                        proteinTarget: p,
                        carbTarget: c,
                        fatTarget: f,
                        bmr: Math.round(bmr),
                        tdee: Math.round(tdee),
                        bmi: parseFloat(bmiValue.toFixed(1)),
                        bmiStatus,
                        waterTarget,
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
            lastActiveDate: null,

            logMeal: (meal) => set((state) => {
                const newMeals = [...state.dailyLog.meals, meal];
                // Recalculate totals
                const consumedCalories = state.dailyLog.consumedCalories + meal.calories;
                const consumedProtein = state.dailyLog.consumedProtein + meal.protein;
                const consumedCarbs = state.dailyLog.consumedCarbs + meal.carbs;
                const consumedFat = state.dailyLog.consumedFat + meal.fat;

                // Update Lunch Insight Notification with new calorie data
                NotificationService.scheduleLunchInsight(consumedCalories, state.profile.dailyCalorieTarget);
                // Update Dinner Insight Notification with new calorie data
                NotificationService.scheduleDinnerInsight(consumedCalories, state.profile.dailyCalorieTarget);

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

            addWater: (amount) => set((state) => {
                const newIntake = state.dailyLog.waterIntake + amount;
                const remaining = state.profile.waterTarget - newIntake;

                // Reschedule notification with updated remaining amount
                NotificationService.scheduleWaterReminder(remaining);

                return {
                    dailyLog: {
                        ...state.dailyLog,
                        waterIntake: newIntake
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
                },
                lastActiveDate: new Date().toDateString(),
            }),

            checkDailyReset: () => {
                const today = new Date().toDateString();
                const { lastActiveDate, resetDailyLog } = get();

                if (lastActiveDate !== today) {
                    resetDailyLog();
                }
            }
        }),
        {
            name: 'foodvision-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
