# Table: `quiz_total_score_time`

**Purpose:** Define quiz configurations (total marks, time limit, passing threshold)

---

## Table Structure

```sql
CREATE TABLE quiz_total_score_time (
    quiz_config_id BIGINT PRIMARY KEY,
    total_marks INT,
    total_time_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `quiz_config_id` | BIGINT | PRIMARY KEY | Unique configuration identifier |
| `total_marks` | INT | NOT NULL | Maximum achievable score |
| `total_time_minutes` | INT | NOT NULL | Time limit in minutes |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Configuration creation time (UTC) |

---

## Foreign Key Relationships

### Child Tables

| Table | FK Column | Description |
|-------|-----------|-------------|
| [quiz_management](quiz_management.md) | quiz_config_id | Quiz sessions using this configuration |

---

## Business Rules

1. **Reusable Configs:** Same configuration can be used for multiple quiz sessions
2. **Immutable:** Once used, configurations should NOT be modified (create new config instead)
3. **Score Calculation:** `total_marks` used in formula: `(correct_answers / total_questions) × total_marks`
4. **Time Enforcement:** 
   - Frontend: Countdown timer warns user
   - Backend: Validates time elapsed between `quiz_management.start_time` and submission timestamp
5. **Passing Threshold:** Not stored here (calculated at application layer, typically 70% of `total_marks`)

---

## Common Queries

### Create Quiz Configuration

```sql
INSERT INTO quiz_total_score_time (total_marks, total_time_minutes)
VALUES (?, ?);
```

### Fetch Configuration

```sql
SELECT * FROM quiz_total_score_time WHERE quiz_config_id = ?;
```

### List Configurations (Admin)

```sql
SELECT * FROM quiz_total_score_time ORDER BY created_at DESC;
```

### Get Quiz Config for Active Session

```sql
SELECT qts.*
FROM quiz_total_score_time qts
JOIN quiz_management qm ON qts.quiz_config_id = qm.quiz_config_id
WHERE qm.quiz_id = ?;
```

---

## Example Configurations

| quiz_config_id | total_marks | total_time_minutes | Use Case |
|----------------|-------------|--------------------|----------|
| 1 | 100 | 30 | Standard employee assessment (10 questions × 10 marks) |
| 2 | 50 | 15 | Quick refresher quiz (5 questions × 10 marks) |
| 3 | 200 | 60 | Comprehensive certification exam (20 questions × 10 marks) |

---

## Recommended Indexes

```sql
-- Primary key auto-indexed, no additional indexes needed for small table
```

---

## Related Documentation

- [Domain: Quiz & Certification](../domains/quiz-certification.md) - Complete quiz workflow
- [Table: quiz_management](quiz_management.md) - Quiz sessions using these configs
- [Performance](../performance.md) - Quiz leaderboard optimization
