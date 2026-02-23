# Table: `rating`

**Purpose:** Store resident feedback ratings for trash collection workers

---

## Table Structure

```sql
CREATE TABLE rating (
    rating_id BIGINT PRIMARY KEY,
    auth_id BIGINT,
    worker_id BIGINT,
    resident_id BIGINT,
    rating_score INT,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rating_auth FOREIGN KEY (auth_id) REFERENCES rating_auth(auth_id),
    CONSTRAINT fk_rating_worker FOREIGN KEY (worker_id) REFERENCES users(user_id),
    CONSTRAINT fk_rating_resident FOREIGN KEY (resident_id) REFERENCES users(user_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `rating_id` | BIGINT | PRIMARY KEY | Unique rating record identifier |
| `auth_id` | BIGINT | FOREIGN KEY → rating_auth(auth_id) | Verification session used for this rating |
| `worker_id` | BIGINT | FOREIGN KEY → users(user_id) | Worker being rated (TRASH_MAN) |
| `resident_id` | BIGINT | FOREIGN KEY → users(user_id) | Resident submitting feedback (RESIDENT) |
| `rating_score` | INT | NOT NULL | Rating value: 1-5 stars |
| `feedback_text` | TEXT | NULL | Optional textual feedback |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Rating submission time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `auth_id` | [rating_auth](rating_auth.md).auth_id | Authentication session (QR/OTP) |
| `worker_id` | [users](users.md).user_id | Worker being rated |
| `resident_id` | [users](users.md).user_id | Resident submitting rating |

---

## Rating Scale

| Stars | Meaning |
|-------|---------|
| 1 ⭐ | Very Poor |
| 2 ⭐⭐ | Poor |
| 3 ⭐⭐⭐ | Average |
| 4 ⭐⭐⭐⭐ | Good |
| 5 ⭐⭐⭐⭐⭐ | Excellent |

---

## Common Queries

### Submit Rating

```sql
INSERT INTO rating (auth_id, worker_id, resident_id, rating_score, feedback_text)
VALUES (?, ?, ?, ?, ?);

-- Mark auth session as used
UPDATE rating_auth SET is_used = 1 WHERE auth_id = ?;
```

### Worker's Average Rating

```sql
SELECT 
    AVG(rating_score) AS avg_rating,
    COUNT(*) AS total_ratings
FROM rating
WHERE worker_id = ?;
```

### Recent Ratings for Worker

```sql
SELECT 
    r.*,
    u.first_name AS resident_name
FROM rating r
JOIN users u ON r.resident_id = u.user_id
WHERE r.worker_id = ?
ORDER BY r.created_at DESC
LIMIT 10;
```

### Ratings Distribution (Analytics)

```sql
SELECT 
    rating_score,
    COUNT(*) AS count
FROM rating
WHERE worker_id = ?
GROUP BY rating_score
ORDER BY rating_score DESC;
```

### Top Rated Workers

```sql
SELECT 
    u.first_name,
    u.last_name,
    AVG(r.rating_score) AS avg_rating,
    COUNT(r.rating_id) AS total_ratings
FROM rating r
JOIN users u ON r.worker_id = u.user_id
GROUP BY r.worker_id
HAVING total_ratings >= 5  -- Minimum 5 ratings to qualify
ORDER BY avg_rating DESC, total_ratings DESC
LIMIT 10;
```

### Feedback with Low Ratings (Red Flags)

```sql
SELECT 
    r.*,
    u.first_name AS worker_name,
    ru.first_name AS resident_name
FROM rating r
JOIN users u ON r.worker_id = u.user_id
JOIN users ru ON r.resident_id = ru.user_id
WHERE r.rating_score <= 2
ORDER BY r.created_at DESC;
```

---

## Recommended Indexes

```sql
-- Worker's ratings (performance dashboard)
CREATE INDEX idx_rating_worker ON rating(worker_id, created_at DESC);

-- Resident's submitted ratings
CREATE INDEX idx_rating_resident ON rating(resident_id, created_at DESC);

-- Analytics (filter by score)
CREATE INDEX idx_rating_score ON rating(rating_score);

-- Auth validation (ensure one rating per auth)
CREATE INDEX idx_rating_auth ON rating(auth_id);
```

---

## Business Rules

1. **One Rating per Auth:** Each `auth_id` should only be used once (enforced by `rating_auth.is_used` flag)
2. **Score Range:** `rating_score` must be between 1 and 5 (validated at application layer)
3. **Role Restrictions:**
   - `worker_id` must be TRASH_MAN role
   - `resident_id` must be RESIDENT role
4. **Denormalization:** `worker_id` copied from `rating_auth` to avoid JOIN in analytics queries
5. **Optional Feedback:** `feedback_text` can be NULL (allow quick star-only ratings)
6. **Timezone:** `created_at` in UTC

---

## Performance Considerations

- **Analytics Caching:** Cache worker average ratings in Redis (update on new rating submission)
- **Denormalization:** Store `worker_id` directly (already done) to avoid JOIN with `rating_auth`
- **Materialized Views:** For dashboards showing rating trends over time, consider materialized view with aggregations
- **Partitioning:** Partition by `created_at` (monthly) for archival after 1 year

---

## Example Cache Strategy (Redis)

```javascript
// On rating submission:
await redis.zadd('worker_ratings', avgRating, workerId);  // Sorted set for leaderboard

// Cache worker stats:
await redis.hset(`worker:${workerId}:stats`, {
    avgRating: avgRating,
    totalRatings: totalCount,
    lastUpdated: Date.now()
});
```

---

## Related Documentation

- [Domain: Rating & Feedback](../domains/rating-feedback.md) - Complete rating workflows
- [Table: rating_auth](rating_auth.md) - QR/OTP verification sessions
- [Table: users](users.md) - Worker and resident details
- [Performance](../performance.md) - Analytics optimization strategies
