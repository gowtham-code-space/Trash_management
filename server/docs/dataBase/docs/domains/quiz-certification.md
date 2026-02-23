# Quiz & Certification Domain

This domain manages knowledge assessment through multiple-choice quizzes with time limits, scoring, and certification tracking for worker training validation.

---

## Domain Overview

**Purpose:** Validate worker knowledge of waste management best practices  
**Key Feature:** Randomized question selection with immutable answer history  
**Tables:** 4 core tables (`question_db`, `quiz_management`, `quiz_history`, `quiz_total_score_time`)  
**External Dependencies:** User authentication (worker roles), real-time timer (frontend)

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `question_db` | Question bank (MCQ repository) | ~500 questions | +20/month |
| `quiz_management` | Quiz sessions and metadata | ~10,000 quizzes | +100/day |
| `quiz_total_score_time` | Score/time limits per quiz type | ~10 quiz types | Static |
| `quiz_history` | User responses for each question | ~200,000 answers | +2,000/day |

---

## Quiz Lifecycle

### Quiz Session Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   COMMISSIONER/ADMIN                        │
│              Creates Quiz Configuration                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. Define Quiz Parameters
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            INSERT INTO quiz_total_score_time                │
│     (quiz_name, total_questions, total_marks, time_limit)   │
│                                                             │
│  Example: "Safety Quiz" - 20 Qs, 100 marks, 30 mins        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. Quiz Published
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      WORKER                                 │
│                  Starts Quiz Session                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 3. POST /quiz/start
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend: quiz.controller.js                    │
├─────────────────────────────────────────────────────────────┤
│  4. Fetch quiz config from quiz_total_score_time            │
│  5. SELECT random questions from question_db (LIMIT 20)     │
│  6. INSERT INTO quiz_management (user_id, created_by, ...)  │
│  7. For each question:                                      │
│      INSERT INTO quiz_history (quiz_id, question_id,        │
│                                 correct_answer, user_answer) │
│      - correct_answer = question_db.correct_option          │
│      - user_answer = NULL (not answered yet)                │
│  8. Return quiz_id + questions (without correct answers)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 9. Quiz Active
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      WORKER                                 │
│              Answers Questions (Timed)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 10. PATCH /quiz/:id/answer
                     │     (per question or batch)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend: Update Answers                        │
├─────────────────────────────────────────────────────────────┤
│ 11. UPDATE quiz_history                                     │
│     SET user_answer = 'B'                                   │
│     WHERE history_id = ?                                    │
│                                                             │
│ 12. Frontend: Timer expires OR Worker clicks "Submit"      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 13. POST /quiz/:id/submit
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend: Calculate Score                       │
├─────────────────────────────────────────────────────────────┤
│ 14. SELECT COUNT(*) FROM quiz_history                       │
│     WHERE quiz_id = ? AND correct_answer = user_answer      │
│     (Count correct answers)                                 │
│                                                             │
│ 15. Calculate percentage:                                   │
│     score = (correct_count / total_questions) * total_marks │
│                                                             │
│ 16. UPDATE quiz_management                                  │
│     SET score = ?, is_submitted = 1                         │
│     WHERE quiz_id = ?                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 17. Return Results
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      WORKER                                 │
│              Views Score + Correct Answers                  │
│                                                             │
│  Example: "Score: 75/100 (15 correct out of 20)"           │
│           "Pass Mark: 60 → PASSED ✅"                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Question Randomization

### Random Question Selection

**Goal:** Each quiz session has different questions (prevents cheating).

**Implementation:**

```sql
-- Fetch 20 random questions
SELECT * FROM question_db 
ORDER BY RAND() 
LIMIT 20;
```

**Optimization (Better Performance):**

```sql
-- Pre-count questions
SET @total_questions = (SELECT COUNT(*) FROM question_db);

-- Generate 20 random IDs
SELECT * FROM question_db 
WHERE question_id IN (
    SELECT FLOOR(1 + RAND() * @total_questions) 
    FROM question_db 
    LIMIT 20
);
```

**Alternative (Category-Based Randomization):**

```sql
-- Future enhancement: Add category column
ALTER TABLE question_db ADD COLUMN category VARCHAR(50);

-- Select 5 questions from each category
(SELECT * FROM question_db WHERE category = 'Safety' ORDER BY RAND() LIMIT 5)
UNION ALL
(SELECT * FROM question_db WHERE category = 'Hygiene' ORDER BY RAND() LIMIT 5)
UNION ALL
(SELECT * FROM question_db WHERE category = 'Equipment' ORDER BY RAND() LIMIT 5)
UNION ALL
(SELECT * FROM question_db WHERE category = 'Regulations' ORDER BY RAND() LIMIT 5);
```

---

## Answer Immutability

### Design Rationale

**Problem:** Admin edits question in `question_db` → Historical quiz scores become invalid.

**Solution:** Copy `correct_option` to `quiz_history.correct_answer` on quiz creation.

**Example:**

```sql
-- Original question in question_db
question_id: 1
question: "What is proper waste segregation?"
option_a: "Mix all waste"
option_b: "Separate dry and wet"  ← Correct
option_c: "No segregation"
option_d: "Only dry waste"
correct_option: 'B'

-- Quiz starts on 2024-01-15
INSERT INTO quiz_history (quiz_id, question_id, correct_answer, user_answer)
VALUES (123, 1, 'B', NULL);  -- Correct answer copied to 'B'

-- User answers 'B' → Correct ✅

-- Admin edits question on 2024-01-20 (changes answer to 'C')
UPDATE question_db SET correct_option = 'C' WHERE question_id = 1;

-- Historical quiz from 2024-01-15 STILL shows correct answer as 'B'
-- Score remains valid despite question edit
```

**Benefits:**
- Prevents retroactive score changes
- Audit trail for question evolution
- Fair grading for past attempts

---

## Scoring Logic

### Score Calculation

**Formula:**

```
correct_count = COUNT(quiz_history WHERE correct_answer = user_answer)
total_questions = COUNT(quiz_history WHERE quiz_id = ?)
total_marks = quiz_total_score_time.total_marks

score = (correct_count / total_questions) * total_marks
```

**Example:**

```
Quiz: "Safety Quiz"
- total_questions = 20
- total_marks = 100
- User answered 15 correctly

score = (15 / 20) * 100 = 75 marks
```

**Pass/Fail Logic:**

```javascript
const passThreshold = quizConfig.pass_mark || 60;  // Default 60%
const passed = score >= passThreshold;

await db.query(`
    UPDATE quiz_management 
    SET score = ?, passed = ?, is_submitted = 1
    WHERE quiz_id = ?
`, [score, passed ? 1 : 0, quizId]);
```

---

## Time Limit Enforcement

### Frontend Timer

**Client-Side Countdown:**

```javascript
// Start timer on quiz load
const startTime = new Date(quizData.created_at);
const timeLimitMinutes = quizConfig.time_limit;
const endTime = new Date(startTime.getTime() + timeLimitMinutes * 60000);

const countdown = setInterval(() => {
    const now = new Date();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
        clearInterval(countdown);
        autoSubmitQuiz(quizId);  // Force submit on timeout
    }
    
    displayTime(remaining);  // Update UI
}, 1000);
```

### Backend Validation

**Prevent Late Submissions:**

```javascript
// quiz.controller.js::submitQuiz()
const quiz = await db.query('SELECT * FROM quiz_management WHERE quiz_id = ?', [quizId]);
const quizConfig = await db.query('SELECT * FROM quiz_total_score_time WHERE quiz_type_id = ?', [quiz.quiz_type_id]);

const elapsedMinutes = (new Date() - new Date(quiz.created_at)) / 60000;

if (elapsedMinutes > quizConfig.time_limit) {
    return res.status(400).json({ 
        error: 'Quiz submission time expired',
        elapsed: elapsedMinutes,
        limit: quizConfig.time_limit
    });
}

// Proceed with scoring
```

---

## Database Schema

### `question_db` Table

```sql
CREATE TABLE question_db (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_option ENUM('A','B','C','D') NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP()
);
```

**Example Data:**

```sql
INSERT INTO question_db (question, option_a, option_b, option_c, option_d, correct_option)
VALUES 
(
    'What color bin is used for dry waste?',
    'Green',
    'Blue',
    'Red',
    'Yellow',
    'B'
),
(
    'How often should garbage collection routes be serviced?',
    'Weekly',
    'Daily',
    'Monthly',
    'Twice a day',
    'B'
);
```

**Indexes:**

```sql
-- Random selection optimization
CREATE INDEX idx_question_id ON question_db(question_id);

-- Full-text search for admin question management
ALTER TABLE question_db ADD FULLTEXT INDEX ft_question_text (question);
```

---

### `quiz_total_score_time` Table

```sql
CREATE TABLE quiz_total_score_time (
    quiz_type_id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_name VARCHAR(255) NOT NULL,
    total_questions INT NOT NULL,
    total_marks INT NOT NULL,
    time_limit INT NOT NULL,           -- Minutes
    pass_mark INT DEFAULT 60,          -- Minimum passing score
    created_at DATETIME DEFAULT UTC_TIMESTAMP()
);
```

**Example Data:**

```sql
INSERT INTO quiz_total_score_time 
(quiz_name, total_questions, total_marks, time_limit, pass_mark)
VALUES 
('Safety & Hygiene Quiz', 20, 100, 30, 60),
('Equipment Handling Quiz', 15, 75, 20, 50),
('Waste Segregation Basics', 10, 50, 15, 40);
```

**Key Columns:**
- `quiz_name`: Display name for quiz type
- `total_questions`: How many questions to randomly select
- `total_marks`: Maximum score (typically 100)
- `time_limit`: Duration in minutes
- `pass_mark`: Minimum score to pass (percentage or absolute)

---

### `quiz_management` Table

```sql
CREATE TABLE quiz_management (
    quiz_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,              -- FK to users (quiz taker)
    quiz_type_id INT NOT NULL,         -- FK to quiz_total_score_time
    score INT DEFAULT 0,
    is_submitted TINYINT(1) DEFAULT 0,
    passed TINYINT(1) DEFAULT 0,
    created_by INT NOT NULL,           -- FK to users (quiz creator/admin)
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    submitted_at DATETIME,
    
    CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_quiz_type FOREIGN KEY (quiz_type_id) REFERENCES quiz_total_score_time(quiz_type_id),
    CONSTRAINT fk_quiz_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

**Key Columns:**
- `user_id`: Worker taking the quiz
- `quiz_type_id`: Links to quiz configuration
- `score`: Final calculated score (NULL until submitted)
- `is_submitted`: 0=in progress, 1=completed
- `passed`: 1=passed, 0=failed (based on pass_mark)
- `created_by`: COMMISSIONER/ADMIN who assigned quiz
- `submitted_at`: Timestamp when quiz submitted (for time limit validation)

**Indexes:**

```sql
-- User's quiz history
CREATE INDEX idx_quiz_user_created 
ON quiz_management(user_id, created_at DESC);

-- Leaderboard queries (top scorers)
CREATE INDEX idx_quiz_score 
ON quiz_management(quiz_type_id, score DESC);

-- pending quizzes
CREATE INDEX idx_quiz_submitted 
ON quiz_management(is_submitted, created_at);
```

---

### `quiz_history` Table

```sql
CREATE TABLE quiz_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,              -- FK to quiz_management
    question_id INT NOT NULL,          -- FK to question_db
    correct_answer ENUM('A','B','C','D') NOT NULL,  -- Immutable copy
    user_answer ENUM('A','B','C','D') DEFAULT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_history_quiz FOREIGN KEY (quiz_id) REFERENCES quiz_management(quiz_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_question FOREIGN KEY (question_id) REFERENCES question_db(question_id)
);
```

**Key Design:**
- **One record per question per quiz** (quiz with 20 questions = 20 rows)
- `correct_answer`: Copied from `question_db.correct_option` on quiz start
- `user_answer`: NULL initially, updated when user selects answer
- `ON DELETE CASCADE`: If quiz deleted, all history records deleted

**Indexes:**

```sql
-- Fetch all questions for a quiz
CREATE INDEX idx_history_quiz 
ON quiz_history(quiz_id);

-- Score calculation query
CREATE INDEX idx_history_quiz_answers 
ON quiz_history(quiz_id, correct_answer, user_answer);
```

---

## Business Rules

### Quiz Creation Rules

1. **Commissioner/Admin Only:** Only `role_id >= 6` can create quiz configurations
2. **Unique Quiz Names:** `quiz_name` in `quiz_total_score_time` must be unique
3. **Minimum Questions:** `total_questions` must be ≤ available questions in `question_db`
4. **Reasonable Time Limits:** `time_limit` must be between 5-120 minutes

### Quiz Attempt Rules

1. **One Active Quiz:** User cannot start new quiz while another is `is_submitted = 0`
2. **No Reopening:** Once submitted, quiz cannot be edited (immutable)
3. **Answer Modification:** Workers can change answers before submission (no restrictions)

### Grading Rules

1. **Unanswered Questions:** NULL `user_answer` = incorrect (0 points)
2. **Partial Credit:** Not supported (binary correct/incorrect per question)
3. **Negative Marking:** Not implemented (no penalty for wrong answers)

---

## Data Flow Diagrams

### Quiz Start Flow

```
WORKER                  BACKEND                  DATABASE
  │                        │                        │
  │ 1. GET /quiz/types     │                        │
  ├───────────────────────→│                        │
  │                        │ 2. Fetch quiz configs  │
  │                        ├───────────────────────→│
  │                        │ SELECT * FROM          │
  │                        │ quiz_total_score_time  │
  │                        │←───────────────────────┤
  │ 3. Quiz type list      │                        │
  │←───────────────────────┤                        │
  │                        │                        │
  │ 4. POST /quiz/start    │                        │
  │    {quiz_type_id: 1}   │                        │
  ├───────────────────────→│                        │
  │                        │ 5. Validate no active  │
  │                        ├───────────────────────→│
  │                        │ SELECT * FROM          │
  │                        │ quiz_management        │
  │                        │ WHERE user_id=? AND    │
  │                        │ is_submitted=0         │
  │                        │←───────────────────────┤
  │                        │ (Empty = OK to start)  │
  │                        │                        │
  │                        │ 6. Fetch random Qs     │
  │                        ├───────────────────────→│
  │                        │ SELECT * FROM          │
  │                        │ question_db            │
  │                        │ ORDER BY RAND()        │
  │                        │ LIMIT 20               │
  │                        │←───────────────────────┤
  │                        │                        │
  │                        │ 7. Create quiz session │
  │                        ├───────────────────────→│
  │                        │ INSERT INTO            │
  │                        │ quiz_management        │
  │                        │ (user_id,              │
  │                        │  quiz_type_id,         │
  │                        │  created_by,           │
  │                        │  is_submitted=0)       │
  │                        │←───────────────────────┤
  │                        │  (quiz_id=123)         │
  │                        │                        │
  │                        │ 8. Insert history (×20)│
  │                        ├───────────────────────→│
  │                        │ INSERT INTO            │
  │                        │ quiz_history           │
  │                        │ (quiz_id, question_id, │
  │                        │  correct_answer,       │
  │                        │  user_answer=NULL)     │
  │                        │ VALUES (123, 1, 'B',   │
  │                        │         NULL), ...     │
  │                        │←───────────────────────┤
  │                        │                        │
  │ 9. Quiz data (NO       │                        │
  │    correct answers)    │                        │
  │←───────────────────────┤                        │
  │    {quiz_id: 123,      │                        │
  │     time_limit: 30,    │                        │
  │     questions: [       │                        │
  │       {history_id: 1,  │                        │
  │        question: "...",│                        │
  │        options: {...}  │                        │
  │       }]}              │                        │
  │                        │                        │
```

---

## Performance Considerations

### Quiz History Cleanup

**Problem:** 200,000+ quiz_history records slow down queries.

**Solution: Partition by Date**

```sql
-- Partition quiz_history by year
ALTER TABLE quiz_history 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Archival Strategy:**

```sql
-- Archive quizzes older than 2 years
CREATE TABLE quiz_history_archive LIKE quiz_history;

INSERT INTO quiz_history_archive 
SELECT * FROM quiz_history 
WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR);

DELETE FROM quiz_history 
WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR);
```

### Question Caching

```javascript
// Redis cache for question bank (1-hour TTL)
const cacheKey = 'question_db:all';
const cachedQuestions = await redis.get(cacheKey);

if (cachedQuestions) {
    return JSON.parse(cachedQuestions);
}

const questions = await db.query('SELECT * FROM question_db');
await redis.setex(cacheKey, 3600, JSON.stringify(questions));
```

---

## Audit & Compliance

### Plagiarism Detection

**Identical Answer Patterns:**

```sql
-- Find users with suspiciously similar answers
SELECT 
    q1.quiz_id AS quiz1,
    q2.quiz_id AS quiz2,
    q1.user_id AS user1,
    q2.user_id AS user2,
    COUNT(*) AS matching_answers
FROM quiz_history q1
JOIN quiz_history q2 
    ON q1.question_id = q2.question_id 
    AND q1.user_answer = q2.user_answer
    AND q1.quiz_id < q2.quiz_id
WHERE q1.quiz_id IN (SELECT quiz_id FROM quiz_management WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY))
GROUP BY q1.quiz_id, q2.quiz_id, q1.user_id, q2.user_id
HAVING matching_answers >= 18;  -- 18/20 same answers = suspicious
```

### Certification Export

**Generate PDF Certificate:**

```sql
-- Fetch passed quizzes for user
SELECT 
    u.name,
    u.email,
    qm.quiz_id,
    qts.quiz_name,
    qm.score,
    qts.total_marks,
    qm.passed,
    qm.submitted_at
FROM quiz_management qm
JOIN quiz_total_score_time qts ON qm.quiz_type_id = qts.quiz_type_id
JOIN users u ON qm.user_id = u.user_id
WHERE qm.user_id = ? AND qm.passed = 1
ORDER BY qm.submitted_at DESC;
```

---

## API Endpoints

### `GET /api/quiz/types`

**Response:**

```json
{
    "quiz_types": [
        {
            "quiz_type_id": 1,
            "quiz_name": "Safety & Hygiene Quiz",
            "total_questions": 20,
            "total_marks": 100,
            "time_limit": 30,
            "pass_mark": 60
        }
    ]
}
```

### `POST /api/quiz/start`

**Request:**

```json
{
    "quiz_type_id": 1
}
```

**Response:**

```json
{
    "quiz_id": 123,
    "time_limit": 30,
    "total_questions": 20,
    "questions": [
        {
            "history_id": 1,
            "question": "What color bin for dry waste?",
            "option_a": "Green",
            "option_b": "Blue",
            "option_c": "Red",
            "option_d": "Yellow"
        }
    ]
}
```

### `PATCH /api/quiz/:id/answer`

**Request:**

```json
{
    "history_id": 1,
    "user_answer": "B"
}
```

**Response:**

```json
{
    "message": "Answer saved",
    "history_id": 1
}
```

### `POST /api/quiz/:id/submit`

**Response:**

```json
{
    "quiz_id": 123,
    "score": 75,
    "total_marks": 100,
    "passed": true,
    "correct_answers": 15,
    "total_questions": 20,
    "submitted_at": "2024-01-15T10:45:00Z"
}
```

---

## Related Documentation

- [Overview](../overview.md) - Quiz & certification domain
- [Architecture](../architecture.md) - Quiz system architecture
- [Enums](../enums.md) - correct_option, user_answer specifications
- [Table: question_db](../tables/question_db.md) - Question bank details
- [Table: quiz_management](../tables/quiz_management.md) - Quiz sessions
- [Table: quiz_history](../tables/quiz_history.md) - Answer tracking
- [Performance](../performance.md) - Quiz query optimization
