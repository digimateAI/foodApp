# FoodVision Mobile App (Android & iOS)

Cross-platform mobile app (React Native or Flutter) for FoodVision – photo-based calorie and macro tracking.   

## Tech stack (suggested)

- React Native (TypeScript) OR Flutter (Dart).
- Navigation:
  - React Navigation (RN) or go_router (Flutter).
- State management:
  - Zustand / Redux Toolkit (RN) or Riverpod / Bloc (Flutter).
- Networking: Axios / Fetch (RN), http/dio (Flutter).

---

## Information architecture

Bottom tab bar:  

1. **Home**
2. **Food**
3. **Activity**
4. **Profile**

---

## Screens

### Onboarding

1. Welcome & sign up  
   - Sign up with Google / Apple / Email.
2. Personal details  
   - Age, gender, height (cm / ft+in), weight (kg / lb).
3. Activity level & goal   
   - Sedentary → Extremely active.
   - Goal: weight loss / maintenance / muscle gain.
4. Daily target preview  
   - Shows calculated BMR, TDEE, daily calories, suggested macros.
   - One-line explanation: “Based on your age, height, weight, activity and goal.”  
5. Connect devices  
   - Apple Health (iOS), Google Fit / Samsung Health (Android).
6. Get started
   - Navigates to Home.

### Home tab

- Widgets:
  - Today’s calories: consumed vs target, progress ring/bar.  
  - Sleep summary: last night duration.
  - Activity summary: steps and exercise minutes/calories.  
- Actions:
  - “Log meal” primary button.
  - Links into detailed Food and Activity screens.

### Food tab

- Day selector (Today, arrows for previous/next).
- Meal cards: Breakfast, Lunch, Dinner, Snacks.  
  - Show total calories + key macros if logged.
- “Log meal” flow:  
  - Step 1: Choose meal type.
  - Step 2: Choose “Take photo” or “Log manually”.
  - Step 3: If photo:
    - Camera view, capture, preview.
    - Loading state while calling Food Vision API.
    - Result list with foods, macros, and editable portions.
  - Step 4: Meal summary:
    - Meal photo or placeholder.
    - Items list, total calories, macros, daily impact.   
    - Confirm/save.

### Activity tab

- Daily view:  
  - Steps.
  - Exercise (minutes, calories).
  - Sleep (hours/minutes).
- Show “last synced at…” and connection status.

### Profile tab

- Sections:  
  - Account (name, email).
  - Personal details (age, gender, height, weight with units).
  - Goal & daily target.
  - Connected devices (Apple/Google/Samsung).
  - Notifications (meal reminders, daily summary).

---

## State & networking

- Persist auth token, profile, and last known daily target locally (AsyncStorage / SharedPreferences).
- On app start:
  - If token → fetch `/me`, `/calories/plan` (if needed), `/me/summaries/today`.
- For meal logging:
  - Draft meal created before upload (optimistic UI).
  - Photo uploaded → show “Analyzing your meal…” state.
  - Result applied to local state, then saved when user confirms.

---

## Design vibe

- Clean, calm health/wellness palette (soft greens/blues + neutral backgrounds).
- Emphasize **one main action per screen** (e.g., Log meal on Home).
- Reuse components:
  - Primary button
  - Card with header + value + chip (e.g., “Calories remaining”)
  - List row with avatar (for foods with small thumbnail)
  - Tag for meal type (Breakfast/Lunch/Dinner/Snacks)

---

## Example prompts for design & UI codegen

Wireframes are designed and are available in the ui folder.

<!-- ### Prompt – High-fidelity wireframes

> You are a senior product designer.  
> Using the flows described in mobile/README.md, design high-fidelity mobile screens (iOS & Android) for the FoodVision app.   
> Focus on:
> - Onboarding (sign up, personal details, goals, daily target preview, connect devices).
> - Home dashboard with calories, sleep, activity, log meal CTA.
> - Food tab with meal cards and “Log meal via photo/manual” flow (including recognition result and meal summary).  
> - Activity tab with steps, exercise, sleep, and sync status.
> - Profile tab with account, personal details, goals, connected devices, and notifications.  
> Use a calm wellness palette, clear hierarchy, and provide layout descriptions suitable for Figma implementation. -->

### Prompt – React Native screen scaffolds

> You are a senior React Native engineer using TypeScript and React Navigation.  
> Generate screen components and navigation setup for the FoodVision app as described in mobile/README.md:   
> - Bottom tabs: Home, Food, Activity, Profile.
> - Stack for onboarding: Welcome, PersonalDetails, ActivityGoal, TargetPreview, ConnectDevices.
> - Implement dummy layouts for:
>   - HomeScreen: shows today’s calories, sleep, activity, and a “Log Meal” button.
>   - FoodScreen: shows meal cards and a “Log Meal” button.
>   - LogMealFlow: choose meal type, choose method (photo/manual), stub CameraScreen and ManualEntryScreen.
>   - ActivityScreen and ProfileScreen with placeholder sections.
> Use functional components, hooks, and simple placeholder data; wire them to a fake API module that returns mocked responses following backend/README contracts.

