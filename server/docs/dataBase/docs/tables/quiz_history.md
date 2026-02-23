# Table: `quiz_history`

**Purpose:** Store individual question answers for each quiz session (answer sheet)

---

## Table Structure

```sql
CREATE TABLE quiz_history (
    history_id BIGINT PRIMARY KEY,
    quiz_id BIGINT,
    question_id BIGINT,
    user_answer ENUM('A', 'B', 'C', 'D'),
    correct_answer ENUM('A', 'B', 'C', 'D'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_history_quiz FOREIGN KEY (quiz_id) REFERENCES quiz_management(quiz_id),
    CONSTRAINT fk_history_question FOREIGN KEY (question_id) REFERENCES question_db(question_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `history_id` | BIGINT | PRIMARY KEY | Unique answer record identifier |
| `quiz_id` | BIGINT | FOREIGN KEY → quiz_management(quiz_id) | Parent quiz session |
| `question_id` | BIGINT | FOREIGN KEY → question_db(question_id) | Question being answered |
| `user_answer` | ENUM | NOT NULL | Student's selected answer (A/B/C/D) - see [enums](../enums.md#user_answer) |
| `correct_answer` | ENUM | NOT NULL | Correct answer copied from question_db (A/B/C/D) - see [enums](../enums.md#correct_option) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Answer submission time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `quiz_id` | [quiz_management](quiz_management.md).quiz_id | Quiz session |
| `question_id` | [question_db](question_db.md).question_id | Question reference |

---

## Answer Immutability Pattern

**Critical Design Decision:** `correct_answer` is copied from `question_db.correct_option` **when the quiz starts**, not when answers are submitted.

### Why Copy the Answer?

```sql
-- When quiz starts, insert records for all questions:
INSERT INTO quiz_history (quiz_id, question_id, user_answer, correct_answer)
SELECT 
    ? AS quiz_id,
    question_id,
    NULL AS user_answer,
    correct_option AS correct_answer
FROM question_db
WHERE question_id IN (?, ?, ?, ...);  -- Selected questions for this quiz
```

**Benefit:** If admin edits `question_db.correct_option` AFTER quiz submission, past quiz scores remain unchanged.

---

## Common Queries

### Initialize Quiz (Copy Questions on Start)

```sql
-- Get random questions first
SELECT question_id, correct_option 
FROM question_db 
ORDER BY RAND() 
LIMIT 10;

-- Then insert into quiz_history with NULL user_answer
INSERT INTO quiz_history (quiz_id, question_id, user_answer, correct_answer)
VALUES (?, ?, NULL, ?);  -- Repeat for each question
```

### Submit Answer (Update User Response)

```sql
UPDATE quiz_history
SET user_answer = ?
WHERE quiz_id = ? AND question_id = ?;
```

### Fetch Quiz Questions for Student

```sql
SELECT 
    qh.history_id,
    qh.question_id,
    qh.user_answer,
    qd.question,
    qd.option_a,
    qd.option_b,
    qd.option_c,
    qd.option_d
FROM quiz_history qh
JOIN question_db qd ON qh.question_id = qd.question_id
WHERE qh.quiz_id = ?;
```

**Note:** Do NOT return `correct_answer` until quiz is submitted.

### Calculate Score (After Quiz Completion)

```sql
SELECT 
    COUNT(*) AS correct_count
FROM quiz_history
WHERE quiz_id = ? 
  AND user_answer = correct_answer;
```

### Review Answers (Show Correct/Incorrect)

```sql
SELECT 
    qd.question,
    qh.user_answer,
    qh.correct_answer,
    (qh.user_answer = qh.correct_answer) AS is_correct
FROM quiz_history qh
JOIN question_db qd ON qh.question_id = qd.question_id
WHERE qh.quiz_id = ?;
```

---

## Recommended Indexes

```sql
-- Fetch all answers for a quiz
CREATE INDEX idx_history_quiz ON quiz_history(quiz_id);

-- Score calculation (filter by quiz + compare answers)
CREATE INDEX idx_history_quiz_answer ON quiz_history(quiz_id, user_answer, correct_answer);

-- Question analytics (how many students got question X correct)
CREATE INDEX idx_history_question ON quiz_history(question_id);
```

---

## Business Rules

1. **Initialization:** Records created with `user_answer = NULL` when quiz starts
2. **One Answer per Question:** Enforce uniqueness on `(quiz_id, question_id)` at application layer
3. **Answer Immutability:** Once `user_answer` is set, it should NOT be changed (no re-submission)
4. **Correct Answer Persistence:** `correct_answer` copied from `question_db.correct_option` ensures score stability
5. **Timezone:** `created_at` in UTC (tracks when student submitted each answer)

---

## Performance Considerations

- **Batch Inserts:** When initializing quiz, insert all questions in single transaction
- **Partitioning:** Partition by `created_at` (yearly) for long-term archival
- **Denormalization:** Consider caching `is_correct` flag instead of calculating during reviews
- **N+1 Prevention:** Eager-load `question_db` when fetching quiz_history records

---

## Analytics Queries

### Question Difficulty (Success Rate)

```sql
SELECT 
    qd.question,
    COUNT(*) AS total_attempts,
    SUM(CASE WHEN qh.user_answer = qh.correct_answer THEN 1 ELSE 0 END) AS correct_attempts,
    ROUND(
        SUM(CASE WHEN qh.user_answer = qh.correct_answer THEN 1 ELSE 0 END) / COUNT(*) * 100,
        2
    ) AS success_rate_percent
FROM quiz_history qh
JOIN question_db qd ON qh.question_id = qd.question_id
GROUP BY qh.question_id
ORDER BY success_rate_percent ASC;  -- Hardest questions first
```

### Student Performance Breakdown

```sql
SELECT 
    (qh.user_answer = qh.correct_answer) AS is_correct,
    COUNT(*) AS count
FROM quiz_history
WHERE quiz_id = ?
GROUP BY is_correct;
```

---

## Related Documentation

- [Domain: Quiz & Certification](../domains/quiz-certification.md) - Answer immutability rationale
- [Table: quiz_management](quiz_management.md) - Parent quiz sessions
- [Table: question_db](question_db.md) - Question source (correct_option copied here)
- [Enums: user_answer](../enums.md#user_answer) - Valid answer values
- [Enums: correct_option](../enums.md#correct_option) - Correct answer enum
