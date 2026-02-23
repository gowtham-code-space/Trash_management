# Table: `quiz_management`

**Purpose:** Track individual quiz sessions (quiz attempts by users)

---

## Table Structure

```sql
CREATE TABLE quiz_management (
    quiz_id BIGINT PRIMARY KEY,
    coach_id BIGINT,
    student_id BIGINT,
    quiz_config_id BIGINT,
    total_questions INT,
    correct_count INT,
    score DECIMAL(5,2),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_quiz_coach FOREIGN KEY (coach_id) REFERENCES users(user_id),
    CONSTRAINT fk_quiz_student FOREIGN KEY (student_id) REFERENCES users(user_id),
    CONSTRAINT fk_quiz_config FOREIGN KEY (quiz_config_id) REFERENCES quiz_total_score_time(quiz_config_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `quiz_id` | BIGINT | PRIMARY KEY | Unique quiz session identifier |
| `coach_id` | BIGINT | FOREIGN KEY → users(user_id) | Admin who assigned quiz (ADMIN role) |
| `student_id` | BIGINT | FOREIGN KEY → users(user_id) | User taking quiz (typically TRASH_MAN) |
| `quiz_config_id` | BIGINT | FOREIGN KEY → quiz_total_score_time(quiz_config_id) | Configuration for this quiz |
| `total_questions` | INT | NOT NULL | Number of questions in this quiz |
| `correct_count` | INT | DEFAULT 0 | Number of correct answers |
| `score` | DECIMAL(5,2) | DEFAULT 0.00 | Final score (calculated) |
| `start_time` | TIMESTAMP | NULL | When user started quiz (UTC) |
| `end_time` | TIMESTAMP | NULL | When user submitted quiz (UTC) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Quiz creation time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `coach_id` | [users](users.md).user_id | Admin who created quiz |
| `student_id` | [users](users.md).user_id | User taking quiz |
| `quiz_config_id` | [quiz_total_score_time](quiz_total_score_time.md).quiz_config_id | Quiz configuration |

### Child Tables

| Table | FK Column | Description |
|-------|-----------|-------------|
| [quiz_history](quiz_history.md) | quiz_id | Individual question answers for this quiz |

---

## Quiz Lifecycle

### 1. Creation (Admin Assigns Quiz)

```sql
INSERT INTO quiz_management (coach_id, student_id, quiz_config_id, total_questions)
VALUES (?, ?, ?, ?);
```

### 2. Start Quiz (Student Begins)

```sql
UPDATE quiz_management
SET start_time = NOW()
WHERE quiz_id = ? AND student_id = ?;
```

### 3. Submit Answers (via quiz_history inserts)

*See [quiz_history](quiz_history.md) for answer recording*

### 4. Calculate Score (After All Answers Submitted)

```sql
UPDATE quiz_management qm
JOIN (
    SELECT 
        quiz_id,
        COUNT(*) AS correct
    FROM quiz_history
    WHERE quiz_id = ? AND user_answer = correct_answer
) AS results ON qm.quiz_id = results.quiz_id
JOIN quiz_total_score_time qts ON qm.quiz_config_id = qts.quiz_config_id
SET 
    qm.correct_count = results.correct,
    qm.score = (results.correct / qm.total_questions) * qts.total_marks,
    qm.end_time = NOW()
WHERE qm.quiz_id = ?;
```

---

## Common Queries

### Student's Quiz History

```sql
SELECT 
    qm.*,
    qts.total_marks,
    qts.total_time_minutes,
    u.first_name AS coach_name
FROM quiz_management qm
JOIN quiz_total_score_time qts ON qm.quiz_config_id = qts.quiz_config_id
JOIN users u ON qm.coach_id = u.user_id
WHERE qm.student_id = ?
ORDER BY qm.created_at DESC;
```

### Leaderboard (Top Scorers)

```sql
SELECT 
    u.first_name,
    u.last_name,
    qm.score,
    qm.correct_count,
    qm.total_questions
FROM quiz_management qm
JOIN users u ON qm.student_id = u.user_id
WHERE qm.end_time IS NOT NULL
ORDER BY qm.score DESC, qm.end_time ASC
LIMIT 10;
```

### Pending Quizzes (Not Started)

```sql
SELECT * FROM quiz_management
WHERE student_id = ? AND start_time IS NULL;
```

### Time Validation (Check if Quiz Expired)

```sql
SELECT 
    qm.quiz_id,
    qts.total_time_minutes,
    TIMESTAMPDIFF(MINUTE, qm.start_time, NOW()) AS elapsed_minutes
FROM quiz_management qm
JOIN quiz_total_score_time qts ON qm.quiz_config_id = qts.quiz_config_id
WHERE qm.quiz_id = ?;
```

---

## Recommended Indexes

```sql
-- Student quiz list
CREATE INDEX idx_quiz_student ON quiz_management(student_id, created_at DESC);

-- Coach dashboard (quizzes assigned)
CREATE INDEX idx_quiz_coach ON quiz_management(coach_id);

-- Leaderboard query (filter completed quizzes)
CREATE INDEX idx_quiz_score ON quiz_management(score DESC, end_time ASC);
```

---

## Business Rules

1. **Role Restrictions:**
   - `coach_id` must be ADMIN role (enforced at API layer)
   - `student_id` typically TRASH_MAN, but can be any role requiring assessment
2. **Quiz States:**
   - **Created:** `start_time = NULL` (assigned but not started)
   - **In Progress:** `start_time != NULL && end_time = NULL`
   - **Completed:** `end_time != NULL`
3. **Time Limit Enforcement:** Backend validates `TIMESTAMPDIFF(MINUTE, start_time, end_time) <= total_time_minutes`
4. **Score Calculation:** Formula: `(correct_count / total_questions) × total_marks`
5. **Retakes:** Students can retake quizzes (new `quiz_id` created each time)
6. **Timezone:** All timestamps in UTC

---

## Performance Considerations

- **Leaderboard:** Index on `(score DESC, end_time ASC)` optimizes top scorer queries
- **Partitioning:** Consider partitioning by `created_at` for archival (e.g., yearly partitions)
- **Caching:** Cache student's quiz count and average score in Redis for dashboard

---

## Related Documentation

- [Domain: Quiz & Certification](../domains/quiz-certification.md) - Complete quiz workflow
- [Table: quiz_history](quiz_history.md) - Individual question answers
- [Table: quiz_total_score_time](quiz_total_score_time.md) - Quiz configurations
- [Performance](../performance.md) - Leaderboard optimization strategies
