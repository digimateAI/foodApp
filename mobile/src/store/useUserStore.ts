import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

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
    photoUrl?: string; // Local URI or Remote URL
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
    user: { uid: string; name: string; email: string; photoUrl?: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    setUser: (user: { uid: string; name: string; email: string; photoUrl?: string }) => void;
    setToken: (token: string) => void;
    login: () => void;
    logout: () => void;
    finishOnboarding: () => void;

    // Profile
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    calculateTargets: () => void;

    // History: "YYYY-MM-DD" -> DailyLog
    history: Record<string, DailyLog>;

    // Daily Log
    dailyLog: DailyLog;
    lastActiveDate: string | null;
    logMeal: (meal: Meal) => void;
    deleteMeal: (id: string) => void;
    addWater: (amount: number) => void;
    resetDailyLog: () => void;
    checkDailyReset: () => void;
    fetchDailyLog: () => Promise<void>;
    fetchDayLog: (date: Date) => Promise<void>;
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
                photoUrl: undefined,
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

                // 6. Water Calculation (Simplified User Requests)
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

            // History Data
            history: {},

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

                const updatedLog = {
                    ...state.dailyLog,
                    meals: newMeals,
                    consumedCalories,
                    consumedProtein,
                    consumedCarbs,
                    consumedFat,
                };

                // Save to history
                const d = new Date();
                const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                return {
                    dailyLog: updatedLog,
                    history: { ...state.history, [today]: updatedLog }
                };
                return {
                    dailyLog: updatedLog,
                    history: { ...state.history, [today]: updatedLog }
                };
            }),

            deleteMeal: (id) => set((state) => {
                const newMeals = state.dailyLog.meals.filter(m => m.id !== id);
                // TODO: Sync delete with Firestore
                return {
                    dailyLog: { ...state.dailyLog, meals: newMeals }
                };
            }),

            fetchDailyLog: async () => {
                const { user } = get();
                if (!user?.email) return;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                try {
                    // Query by Email (since we updated CameraScreen to store userEmail)
                    // OR userId. CameraScreen uses user.email as userId if available.
                    // The Firestore doc says: userId: userIdentifier.
                    // userIdentifier = user.email || user.uid...
                    const userIdentifier = user.email || user.uid;

                    const q = query(
                        collection(db, 'users', userIdentifier, 'meals'),
                        where('date', '>=', today.toISOString()),
                        where('date', '<', tomorrow.toISOString())
                    );

                    const querySnapshot = await getDocs(q);
                    const fetchedMeals: Meal[] = [];
                    let fetchedCalories = 0;
                    let fetchedProtein = 0;
                    let fetchedCarbs = 0;
                    let fetchedFat = 0;

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        let type = data.type;
                        if (type === 'snack') type = 'snacks';

                        const meal: Meal = {
                            id: doc.id,
                            type: type,
                            name: data.items.map((i: any) => i.name).join(', '),
                            calories: data.items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0),
                            protein: data.items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0),
                            carbs: data.items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0),
                            fat: data.items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0),
                            imageUri: data.photoUrl,
                            timestamp: new Date(data.date).getTime()
                        };
                        fetchedMeals.push(meal);
                        fetchedCalories += meal.calories;
                        fetchedProtein += meal.protein;
                        fetchedCarbs += meal.carbs;
                        fetchedFat += meal.fat;
                    });

                    set((state) => ({
                        dailyLog: {
                            ...state.dailyLog,
                            meals: fetchedMeals,
                            consumedCalories: fetchedCalories,
                            consumedProtein: fetchedProtein,
                            consumedCarbs: fetchedCarbs,
                            consumedFat: fetchedFat,
                        }
                    }));

                } catch (error) {
                    console.error("Failed to fetch daily log:", error);
                }
            },

            fetchDayLog: async (date: Date) => {
                console.log("fetchDayLog: Fetching log for date:", date.toISOString());
                const { user } = get();
                if (!user?.email) {
                    console.log("fetchDayLog: No user email, returning.");
                    return;
                }

                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);

                const dateKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

                // Get today's key consistently
                const now = new Date();
                const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                try {
                    const userIdentifier = user.email || user.uid;
                    console.log(`fetchDayLog: Querying meals for user ${userIdentifier} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

                    const q = query(
                        collection(db, 'users', userIdentifier, 'meals'),
                        where('date', '>=', startDate.toISOString()),
                        where('date', '<', endDate.toISOString())
                    );

                    const querySnapshot = await getDocs(q);
                    const fetchedMeals: Meal[] = [];
                    let fetchedCalories = 0;
                    let fetchedProtein = 0;
                    let fetchedCarbs = 0;
                    let fetchedFat = 0;

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        let type = data.type;
                        if (type === 'snack') type = 'snacks';

                        const meal: Meal = {
                            id: doc.id,
                            type: type,
                            name: data.items.map((i: any) => i.name).join(', '),
                            calories: data.items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0),
                            protein: data.items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0),
                            carbs: data.items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0),
                            fat: data.items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0),
                            imageUri: data.photoUrl,
                            timestamp: new Date(data.date).getTime()
                        };
                        fetchedMeals.push(meal);
                        fetchedCalories += meal.calories;
                        fetchedProtein += meal.protein;
                        fetchedCarbs += meal.carbs;
                        fetchedFat += meal.fat;
                    });

                    console.log(`fetchDayLog: Fetched ${fetchedMeals.length} meals for ${dateKey}.`);
                    console.log(`fetchDayLog: Total Calories: ${fetchedCalories}, Protein: ${fetchedProtein}, Carbs: ${fetchedCarbs}, Fat: ${fetchedFat}`);

                    // Construct the log object
                    // Note: We might be missing water/steps/sleep for past days if not stored in 'meals'.
                    // Assuming for now we just want meals/macros.
                    // If we had a separate 'days' collection, we'd fetch that too.
                    // For now, let's use what we have or defaults.
                    // If history already has this day, preserve other fields (water, etc) if they exist.
                    const existingLog = get().history[dateKey] || {
                        meals: [],
                        consumedCalories: 0,
                        consumedProtein: 0,
                        consumedCarbs: 0,
                        consumedFat: 0,
                        waterIntake: 0,
                        steps: 0,
                        sleepDuration: '0h',
                    };

                    const updatedLog: DailyLog = {
                        ...existingLog,
                        meals: fetchedMeals,
                        consumedCalories: fetchedCalories,
                        consumedProtein: fetchedProtein,
                        consumedCarbs: fetchedCarbs,
                        consumedFat: fetchedFat,
                    };

                    set((state) => {
                        const newHistory = { ...state.history, [dateKey]: updatedLog };

                        // If fetching for today, also update dailyLog
                        if (dateKey === todayKey) {
                            console.log("fetchDayLog: Updating dailyLog for today.");
                            return {
                                history: newHistory,
                                dailyLog: { ...state.dailyLog, ...updatedLog }
                            };
                        }
                        console.log("fetchDayLog: Updating history for past day.");
                        return { history: newHistory };
                    });

                } catch (error) {
                    console.error("Failed to fetch day log:", error);
                }
            },

            addWater: (amount) => set((state) => {
                const newIntake = Math.max(0, state.dailyLog.waterIntake + amount);
                const remaining = state.profile.waterTarget - newIntake;

                // Reschedule notification with updated remaining amount
                NotificationService.scheduleWaterReminder(remaining);

                const updatedLog = {
                    ...state.dailyLog,
                    waterIntake: newIntake
                };

                // Save to history
                const d = new Date();
                const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                return {
                    dailyLog: updatedLog,
                    history: { ...state.history, [today]: updatedLog }
                };
            }),

            resetDailyLog: () => set((state) => {
                // Before resetting, ensure current day logs are in history (should be already, but safe check)
                // Actually reset usually happens at start of new day. Old day is safe.

                const newLog = {
                    meals: [],
                    consumedCalories: 0,
                    consumedProtein: 0,
                    consumedCarbs: 0,
                    consumedFat: 0,
                    waterIntake: 0,
                    steps: 0,
                    sleepDuration: '0h',
                };

                // We don't overwrite history of TODAY with empty. We just reset the "active tracker".
                // When we start logging for new day, it writes to new date key.
                const d = new Date();
                const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                return {
                    dailyLog: newLog,
                    lastActiveDate: todayKey, // Standardize date format
                };
            }),

            checkDailyReset: () => {
                const now = new Date();
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const { lastActiveDate, resetDailyLog } = get();

                if (lastActiveDate !== today) {
                    resetDailyLog();
                }
            }
        }),
        {
            name: 'foodvision-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                profile: state.profile,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                // dailyLog and history are excluded so they are fetched fresh
            }),
        }
    )
);
