# FoodVision Backend

Backend for FoodVision – a photo-based food tracking app. Provides APIs for auth, users, calories, meals, foods, activity, and insights.   

## Stack (suggested)

- Runtime: Node.js + TypeScript OR Python + FastAPI.
- DB: Postgres (via Prisma/SQLAlchemy).
- Storage: S3/GCS for meal photos.
- Auth: JWT + OAuth (Google, Apple).

---

## Core responsibilities

- Implement calorie logic as per `Calorie-Calculation.md` (BMR, TDEE, goals, macros).  
- Manage users, profiles, goals, and activity level.  
- Manage foods, meals, meal items, and meal photos.  
- Integrate with Food Vision API + Nutrition LLM.
- Integrate with health platforms (Apple Health, Google Fit, Samsung Health).  
- Generate daily/weekly summaries and adaptive TDEE.  

---

## Domain model (minimum)

**User & profile**

- `User`
  - id, email, auth_provider, created_at
- `Profile`
  - user_id
  - name, age, gender
  - height_value, height_unit
  - weight_value, weight_unit
  - activity_level (sedentary, light, moderate, very, extreme)
- `Goal`
  - user_id
  - type (loss, maintenance, gain)
  - target_daily_calories
  - target_protein_g, target_carbs_g, target_fat_g

**Food & meals**

- `Food`
  - id, name, locale, aliases, default_portion, default_unit
  - calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
  - source (canonical, community, llm_estimated)
- `Meal`
  - id, user_id, date, meal_type (breakfast/lunch/dinner/snacks)
  - total_calories, total_protein_g, total_carbs_g, total_fat_g
- `MealItem`
  - id, meal_id, food_id
  - name_override?, portion_value, portion_unit
  - calories, protein_g, carbs_g, fat_g
- `MealPhoto`
  - id, meal_id, image_uri, status (uploaded, analyzed, failed)
  - raw_prediction (JSON), final_label_set (JSON)

**Activity & sleep**

- `DeviceConnection`
  - id, user_id, provider (apple, google, samsung)
  - access_tokens, scopes
- `DailyActivity`
  - id, user_id, date
  - steps, exercise_minutes, exercise_calories
  - sleep_minutes

**Summaries & tuning**

- `DailySummary`
  - user_id, date
  - calories_target, calories_consumed
  - protein_g, carbs_g, fat_g
  - steps, sleep_minutes
- `AdaptiveTDEEState`
  - user_id
  - current_tdee_estimate
  - last_recalculated_at

---

## Key endpoints (sketch)

Auth & user

- `POST /auth/signup`
- `POST /auth/login`
- `GET /me`
- `PUT /me/profile`
- `PUT /me/goal`

Calories & plan

- `POST /calories/plan`
  - body: age, gender, height, weight, units, activity_level, goal_type
  - returns: bmr, tdee, target_calories, suggested_macros.  

Food & meals

- `GET /foods/search?q=dal`
- `POST /foods/custom`
- `GET /me/meals?date=YYYY-MM-DD`
- `POST /me/meals` (create draft meal)
- `POST /me/meals/{id}/photo` (upload, returns signed URL / triggers analysis)
- `POST /me/meals/{id}/items` (set items after UI edit)
- `POST /me/meals/{id}/finalize`

Activity & summary

- `GET /me/activity?date=YYYY-MM-DD`
- `GET /me/summaries/today`
- `GET /me/summaries/week`
- `POST /me/activity/sync` (webhooks/background jobs)

---

## Calorie engine contract

Implementation must follow `Calorie-Calculation.md`:  

- Mifflin-St Jeor BMR:
  - Males: \(10×kg + 6.25×cm − 5×years + 5\)
  - Females: \(10×kg + 6.25×cm − 5×years − 161\)
- TDEE = BMR × activity_factor.
  - 1.2 / 1.375 / 1.55 / 1.725 / 1.9  
- Goals:
  - Loss: target_calories = TDEE − 500 (default).
  - Maintenance: TDEE ± 100.
  - Gain: TDEE + 400 (default).  
- Macro suggestions:
  - Use ranges from README for protein, carbs, fat per goal.  

---

## ML integration points

- **Food Vision Service**
  - Input: signed image URL.
  - Output: `{ items: [{ name, confidence, bbox? }], error? }`.  

- **Nutrition LLM**
  - Input: list of candidate item names, locale, user goal.
  - Output: canonical food IDs + macros (from DB or inferred).

---

## Example “vibe coding” prompt for backend codegen

Use this to ask your codegen LLM:

> You are a senior backend engineer using Node.js, TypeScript, Express, and Prisma with PostgreSQL.
> Implement the initial version of the FoodVision backend with:
> - Models: User, Profile, Goal, Food, Meal, MealItem, MealPhoto, DailyActivity, DailySummary as described in backend/README.md.   
> - Calorie engine that implements Mifflin-St Jeor BMR, TDEE, and goal calorie logic exactly as per Calorie-Calculation.md.  
> - REST endpoints: /auth/signup, /auth/login, /me, /me/profile, /me/goal, /calories/plan, /foods/search, /me/meals (list/create), /me/meals/:id/photo, /me/meals/:id/items, /me/meals/:id/finalize, /me/activity, /me/summaries/today.
> - Use JWT auth middleware and basic request validation.
> Generate:
> - Prisma schema
> - Express route handlers skeleton
> - Service-layer functions for calorie plan and meal creation
> - Example unit tests for the calorie engine and /calories/plan.
