# Table: `question_db`

**Purpose:** Store quiz question bank for worker knowledge assessments

---

## Table Structure

```sql
CREATE TABLE question_db (
    question_id BIGINT PRIMARY KEY,
    question TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option ENUM('A', 'B', 'C', 'D'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `question_id` | BIGINT | PRIMARY KEY | Unique question identifier |
| `question` | TEXT | NOT NULL | Question text |
| `option_a` | TEXT | NOT NULL | Choice A |
| `option_b` | TEXT | NOT NULL | Choice B |
| `option_c` | TEXT | NOT NULL | Choice C |
| `option_d` | TEXT | NOT NULL | Choice D |
| `correct_option` | ENUM | NOT NULL | Correct answer (A/B/C/D) - see [enums](../enums.md#correct_option) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Question creation timestamp (UTC) |

---

## Business Rules

1. **Answer Immutability:** Once a question is used in a quiz, changing `correct_option` should NOT affect past quiz scores (see [quiz_history](quiz_history.md) for copied answer logic)
2. **No Soft Delete:** Questions remain in database even if retired (use `is_active` flag at application layer if needed)
3. **Random Selection:** Questions selected using `ORDER BY RAND()` for quiz generation (see performance note below)
4. **Content Validation:** Question text must be unique (enforced at application layer)

---

## Common Queries

### Add Question

```sql
INSERT INTO question_db (question, option_a, option_b, option_c, option_d, correct_option)
VALUES (?, ?, ?, ?, ?, ?);
```

### Random Question Selection for Quiz

```sql
SELECT * FROM question_db
ORDER BY RAND()
LIMIT ?;  -- Number of questions in quiz
```

**Performance Note:** For large question banks (>10k questions), use:
```sql
SELECT * FROM question_db
WHERE question_id >= (
    SELECT FLOOR(RAND() * (SELECT MAX(question_id) FROM question_db))
)
ORDER BY question_id
LIMIT ?;
```

### Fetch Question by ID

```sql
SELECT * FROM question_db WHERE question_id = ?;
```

### Get All Questions (Admin View)

```sql
SELECT * FROM question_db ORDER BY created_at DESC;
```

### Validate Answer

```sql
SELECT correct_option FROM question_db WHERE question_id = ?;
```

---

## Recommended Indexes

```sql
-- Primary key auto-indexed
-- Additional index for random selection optimization:
CREATE INDEX idx_question_created ON question_db(created_at);
```

---

## Related Documentation

- [Domain: Quiz & Certification](../domains/quiz-certification.md) - Quiz lifecycle and question selection
- [Table: quiz_management](quiz_management.md) - Quiz configurations referencing questions
- [Table: quiz_history](quiz_history.md) - Student answers with copied correct_option
- [Enums: correct_option](../enums.md#correct_option) - Valid answer values (A/B/C/D)
