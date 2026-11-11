# Trivia Game System - Database Migration Complete

## Overview
Your trivia game has been successfully migrated from a static TypeScript file to a database-backed system with analytics capabilities.

## What Changed

### 1. Database Schema
Added three new models to `prisma/schema.prisma`:

- **TriviaQuestion**: Stores questions with analytics
  - Fields: question, options, correctAnswer, category, difficulty, explanation
  - Analytics: timesAsked, timesCorrect, difficultyRating
  - Metadata: isActive, createdBy, referenceId (for backward compatibility)

- **TriviaGameAnswer**: Tracks individual question answers per session
  - Links sessions to questions
  - Records user's answer and whether it was correct
  - Optional timeTaken field

- **TriviaGameSession**: Updated to include answers relation
  - Now tracks detailed answer history per game session

### 2. Admin API Endpoints

#### GET /api/admin/trivia-questions
List all trivia questions with filtering and pagination
- Query params: `page`, `limit`, `category`, `difficulty`, `isActive`
- Requires: super_admin or dev role

#### POST /api/admin/trivia-questions
Create a new trivia question
- Body: `{ question, options, correctAnswer, category, difficulty, explanation }`
- Requires: super_admin or dev role

#### PATCH /api/admin/trivia-questions/[questionId]
Update an existing question
- Body: any subset of question fields
- Requires: super_admin or dev role

#### DELETE /api/admin/trivia-questions/[questionId]
Soft delete a question (sets isActive to false)
- Requires: super_admin or dev role

### 3. Game API Updates

#### GET /api/trivia/questions
Now fetches questions from database instead of TypeScript file
- Query params: `count`, `difficulty`, `category`
- Automatically increments `timesAsked` for each question served
- Shuffles and returns random questions

#### POST /api/trivia/submit
Enhanced to track per-question performance
- The `answers` array must contain one entry for every question, and `submissionId`
  must be a UUID that remains the same when retrying the same game.
  ```typescript
  {
    correct: number,
    total: number,
    points: number,
    streak: number,
    submissionId: string,
    answers: [
      {
        questionId: string,
        userAnswer: number,
        isCorrect: boolean
      }
    ]
  }
  ```
- Updates question analytics (timesCorrect, difficultyRating)
- Records detailed answer history

## Migration Results

✅ **50 questions migrated** from `lib/trivia-questions.ts` to database
✅ **Database schema updated** with new collections and indexes
✅ **Admin APIs created** for full CRUD operations
✅ **Game APIs updated** to use database
✅ **Analytics tracking** implemented

## Benefits of the New System

1. **Dynamic Management**: Add/edit questions without code deployment
2. **Analytics**: Track which questions are hardest/easiest
3. **Versioning**: Update questions while preserving history
4. **Performance Data**: See timesAsked, timesCorrect, difficultyRating
5. **Soft Delete**: Retire old questions without losing data
6. **Scalability**: Easily add hundreds or thousands of questions

## Next Steps for Frontend

To fully utilize the new system, update your frontend to:

1. **Send detailed answers** when submitting trivia results:
   ```javascript
   fetch('/api/trivia/submit', {
     method: 'POST',
     body: JSON.stringify({
       correct: 1,
       total: 2,
       points: 10,
       streak: 1,
       submissionId: crypto.randomUUID(),
       answers: [
         { questionId: '...', userAnswer: 2, isCorrect: true },
         { questionId: '...', userAnswer: 1, isCorrect: false },
         // ... for each question
       ]
     })
   })
   ```

2. **Build admin UI** for question management (optional)
   - List questions with filters
   - Create/edit/delete questions
   - View analytics per question

3. **Use category filter** (optional)
   - Request specific categories: `?category=grammar&difficulty=intermediate`

## Trivia Leaderboard

Authenticated users can view the top 10 trivia players at `/dashboard/trivia/leaderboard`.
The leaderboard link is available in the trivia game and results screens. Its data comes
from `GET /api/trivia/leaderboard`, which ranks users by the sum of their recorded trivia
session points.

Players start at Level 1 with three hearts per UTC day. Skipping a question, timing out,
or using all three attempts incorrectly costs one heart. When all hearts are lost, trivia
is locked until the next UTC midnight. The count and lock are stored on the user account
and enforced by the question and score-submission APIs, so they persist across reloads.
Completing a level with at least one heart still requires the existing 70% accuracy to
unlock the next level. Existing trivia points and session history are retained when levels
are reset.
The correct-answer streak continues when a player answers a question correctly after an
earlier wrong attempt, and resets when a question is failed, skipped, or times out.

Players may complete up to 10 level games per East Africa Time day (UTC+3). A game counts
when its results are saved, including replays; abandoned games do not count. The limit
resets at midnight EAT. The separate heart reset remains midnight UTC.

## Backward Compatibility

- The old `lib/trivia-questions.ts` file still exists but is no longer used by the API
- Old question IDs (like "g1", "v1") are preserved in the `referenceId` field
- Frontend should start using the new MongoDB `id` field from the API response

## Analytics Data Available

Each question now tracks:
- **timesAsked**: How many times the question was shown to users
- **timesCorrect**: How many times users answered correctly
- **difficultyRating**: Calculated from 0 (easy) to 1 (hard) based on correct rate

You can query this data via the admin API to identify:
- Hardest questions (high difficultyRating)
- Most/least popular questions (timesAsked)
- Questions with low engagement

## Example API Calls

### Get 10 random beginner questions
```
GET /api/trivia/questions?count=10&difficulty=beginner
```

### Get grammar questions only
```
GET /api/trivia/questions?category=grammar
```

### List all questions (admin)
```
GET /api/admin/trivia-questions?page=1&limit=50
```

### Create new question (admin)
```
POST /api/admin/trivia-questions
{
  "question": "What is the past tense of 'run'?",
  "options": ["runned", "ran", "running", "runs"],
  "correctAnswer": 1,
  "category": "grammar",
  "difficulty": "beginner",
  "explanation": "The past tense of 'run' is 'ran'."
}
```
