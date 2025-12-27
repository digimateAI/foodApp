# FoodVision – Photo-Based Food & Calorie Tracking App

FoodVision is a mobile app (Android + iOS) that lets users track calories and macros using **meal photos + manual logging**, backed by an evidence-based calorie engine.   

## Core value props

- Take a **photo of your meal** → get calorie and macro estimates.
- Strong coverage for **Indian and regional foods** via LLM + local food dictionary.
- **Evidence-based** BMR/TDEE + goal calories (weight loss, maintenance, muscle gain).  
- Activity & sleep sync from Apple Health / Google Fit / Samsung Health.  

---

## High-level architecture

- **Mobile app** (React Native / Flutter)
  - Tabs: Home, Food, Activity, Profile.  

- **Backend**
  - Auth & User Service
  - Calorie Engine Service (BMR/TDEE, goal targets using Calorie-Calculation.md)  
  - Food & Nutrition Service (canonical food DB + local foods)
  - Meal Logging Service (photo + manual flows)  
  - Activity & Sleep Service (wearable integrations)  
  - Insights Service (adherence, trends, adaptive TDEE)  

- **ML/AI**
  - Food Vision API (image → dish labels + confidence)  
  - Nutrition LLM (maps names to DB, infers macros if missing)
  - Active learning pipeline (uses user corrections for future model training)

- **Storage**
  - Relational DB (Postgres/MySQL)
  - Object storage for meal photos (UUID keys)
  - Analytics warehouse/lake for long-term analysis and model training

---

## Features

- Onboarding:
  - Sign up with Google, Apple, or Email.  
  - Capture age, gender, height, weight, units.  
  - Select activity level & goal (lose, maintain, gain).   
  - Show daily calorie target and macro guidance.  
  - Optional connect to Apple Health / Google Fit / Samsung Health.  

- Home:
  - Today’s calories consumed vs target.
  - Sleep summary, activity summary.
  - Quick “Log meal” CTA.  

- Food:
  - Breakfast / Lunch / Dinner / Snacks sections.  
  - Log via photo or manual search.
  - Recognition result screen with editable items.
  - Meal summary: photo, items, calories, macros, daily impact.   

- Activity:
  - Steps, exercise, and sleep per day from connected services.  

- Profile:
  - Account & personal details.
  - Goals & daily target.
  - Connected devices and notifications.  

---

## Repos

- `/backend` – API, BMR/TDEE engine, food DB, meal logging, activity integrations.
- `/mobile` – React Native / Flutter app (Android & iOS).
- `/ml` – Food vision service, LLM glue, training scripts (later).

See `backend/README.md` and `mobile/README.md` for vibe‑coding details.
