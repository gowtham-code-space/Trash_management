# Performance & Optimization

This document outlines indexing strategies, query optimization techniques, and scalability considerations for the Trash Management System database.

---

## Overview

**Optimization Priorities:**
1. **Read-Heavy Workloads:** Dashboard queries, complaint tracking, attendance logs (80% of traffic)
2. **Write Performance:** Real-time complaint submission, attendance uploads
3. **Join Optimization:** Multi-table dashboards (complaints + tasks + users + geography)
4. **Scalability:** Horizontal sharding for multi-tenant deployments

**Performance Targets:**
- Dashboard queries: < 200ms (P95)
- Complaint submission: < 100ms (P99)
- Attendance verification: < 150ms (P95)
- Geographic queries (route lookup): < 50ms (P99)

---

## Primary Key Strategy

### Auto-Increment vs UUID

**Current Implementation:** Auto-increment integers for all primary keys

**Rationale:**
- **Smaller Index Size:** INT (4 bytes) vs UUID (16 bytes) = 75% space savings
- **Sequential Writes:** B-tree optimization for append-only inserts
- **Join Performance:** Integer comparisons faster than string comparisons
- **Developer Experience:** Human-readable IDs for debugging

**Trade-Offs:**
- **No Global Uniqueness:** Cannot merge databases without ID conflicts
- **Enumeration Risk:** Attackers can guess sequential IDs (mitigated by UUID in complaints.complaint_uuid)

**Hybrid Approach (Currently Used):**

```sql
-- Public-facing identifier (UUID)
resident_complaints.complaint_uuid VARCHAR(36) UNIQUE NOT NULL

-- Internal identifier (auto-increment)
resident_complaints.complaint_id INT PRIMARY KEY AUTO_INCREMENT
```

**Benefits:**
- External API uses `complaint_uuid` (prevents enumeration)
- Internal joins use `complaint_id` (fast integer comparisons)

---

## Foreign Key Indexing

### Auto-Indexed Columns

Foreign key constraints automatically create indexes on **referencing columns** (child table):

```sql
-- Automatically indexed by FK constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_role 
FOREIGN KEY (role_id) REFERENCES role(role_id);
-- Creates index on users.role_id
```

### Manual Indexes Required

**Parent table referenced columns** need manual indexing if not primary keys:

```sql
-- users.email is UNIQUE but not PK
-- Queries: SELECT * FROM users WHERE email = ?
CREATE INDEX idx_users_email ON users(email);
```

### Current FK Index Inventory

| Child Table | FK Column | Parent Table | Auto-Indexed | Manual Action Needed |
|-------------|-----------|--------------|--------------|----------------------|
| `users` | `role_id` | `role` | ✅ | None |
| `auth_otp` | `user_id` | `users` | ✅ | None |
| `attendance` | `user_id` | `users` | ✅ | None |
| `attendance` | `verified_by` | `users` | ✅ | None |
| `geo_attendance` | `att_id` | `attendance` | ✅ | None |
| `zone` | `district_id` | `district` | ✅ | None |
| `ward` | `zone_id` | `zone` | ✅ | None |
| `ward_divisions` | `ward_id` | `ward` | ✅ | None |
| `street` | `ward_id` | `ward` | ✅ | None |
| `route` | `street_id` | `street` | ✅ | None |
| `street_divisions` | `route_id` | `route` | ✅ | None |
| `street_divisions` | `division_id` | `ward_divisions` | ✅ | None |
| `trashman_assignment` | `user_id` | `users` | ✅ | None |
| `trashman_assignment` | `route_id` | `route` | ✅ | None |
| `resident_complaints` | `user_id` | `users` | ✅ | None |
| `resident_complaints` | `route_id` | `route` | ✅ | None |
| `immediate_tasks` | `task_source` | `resident_complaints` | ✅ | None |
| `immediate_tasks` | `assigned_to` | `users` | ✅ | None |
| `immediate_tasks` | `division_id` | `ward_divisions` | ✅ | None |
| `division_officers` | `division_id` | `ward_divisions` | ✅ | None |
| `division_officers` | `user_id` | `users` | ✅ | None |
| `quiz_management` | `created_by` | `users` | ✅ | None |
| `quiz_history` | `quiz_id` | `quiz_management` | ✅ | None |
| `quiz_history` | `question_id` | `question_db` | ✅ | None |
| `rating_auth` | `worker_id` | `users` | ✅ | None |
| `rating` | `auth_id` | `rating_auth` | ✅ | None |

**All FK columns already indexed via constraints. No manual action needed.**

---

## Composite Indexes

### High-Impact Composite Indexes

**1. Complaint Dashboard Queries**

```sql
-- Query: Fetch complaints by supervisor's division and status
-- SELECT * FROM resident_complaints 
-- WHERE route_id IN (SELECT route_id FROM trashman_assignment WHERE user_id = ?) 
--   AND complaint_status = 'PENDING'
-- ORDER BY created_at DESC;

CREATE INDEX idx_complaints_route_status_created 
ON resident_complaints(route_id, complaint_status, created_at DESC);
```

**Optimization Impact:**
- Before: Full table scan (100k complaints ≈ 800ms)
- After: Index scan (filtered ≈ 50ms)
- Benefit: Covers WHERE + ORDER BY in single index

**2. Attendance Verification Queue**

```sql
-- Query: Supervisor views unverified geo-tagged attendance
-- SELECT a.*, ga.geo_img FROM attendance a
-- JOIN geo_attendance ga ON a.att_id = ga.att_id
-- WHERE a.verified_by IS NULL AND a.att_type = 'GEO_SELFIE'
-- ORDER BY a.created_at ASC;

CREATE INDEX idx_attendance_verification 
ON attendance(verified_by, att_type, created_at);
```

**Optimization:**
- `verified_by IS NULL` uses index (leftmost column)
- `att_type = 'GEO_SELFIE'` filters on next column
- `created_at ASC` allows index-only ORDER BY

**3. Task Assignment Lookup**

```sql
-- Query: Find active tasks for worker
-- SELECT * FROM immediate_tasks 
-- WHERE assigned_to = ? AND status != 'COMPLETED'
-- ORDER BY due_date ASC;

CREATE INDEX idx_tasks_worker_status_due 
ON immediate_tasks(assigned_to, status, due_date);
```

**4. Quiz Leaderboard**

```sql
-- Query: Top scorers in recent quizzes
-- SELECT user_id, SUM(score) AS total_score 
-- FROM quiz_management 
-- WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
-- GROUP BY user_id 
-- ORDER BY total_score DESC LIMIT 10;

CREATE INDEX idx_quiz_created_user 
ON quiz_management(created_at, user_id);
```

**Note:** Covering index would include `score`:

```sql
CREATE INDEX idx_quiz_created_user_score 
ON quiz_management(created_at, user_id, score);
-- Avoids table lookup for score column
```

**5. Geographic Hierarchy Navigation**

```sql
-- Query: Find all routes in a ward
-- SELECT r.* FROM route r
-- JOIN street s ON r.street_id = s.street_id
-- WHERE s.ward_id = ?;

-- No additional index needed (street.ward_id already indexed)
-- But add covering index for denormalization queries:

CREATE INDEX idx_street_ward_id 
ON street(ward_id, street_id);
-- Allows index-only scan without table lookup
```

**6. OTP Validation (Time-Sensitive)**

```sql
-- Query: Find valid OTP for user
-- SELECT * FROM auth_otp 
-- WHERE user_id = ? 
--   AND otp_type = 'EMAIL' 
--   AND is_used = 0 
--   AND expire_at > UTC_TIMESTAMP();

CREATE INDEX idx_otp_validation 
ON auth_otp(user_id, otp_type, is_used, expire_at);
```

**Critical for Security:**
- Fast OTP lookups prevent login delays
- Expired OTP cleanup uses same index:

```sql
DELETE FROM auth_otp WHERE expire_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY);
-- Uses idx_otp_validation for efficient deletion
```

**7. Rating Analytics**

```sql
-- Query: Average rating for worker in last 90 days
-- SELECT AVG(rating_score) FROM rating 
-- WHERE rating_auth_id IN (SELECT auth_id FROM rating_auth WHERE worker_id = ?)
--   AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90 DAY);

-- Denormalize worker_id to rating table for direct index:
ALTER TABLE rating ADD COLUMN worker_id INT;
UPDATE rating r 
JOIN rating_auth ra ON r.auth_id = ra.auth_id 
SET r.worker_id = ra.worker_id;

CREATE INDEX idx_rating_worker_created 
ON rating(worker_id, created_at);
```

**Denormalization Trade-Off:**
- Adds 4 bytes per rating record
- Eliminates JOIN (100x faster for worker analytics)
- Must keep in sync with rating_auth updates (application logic)

---

## Full-Text Search Indexes

### Complaint Search

```sql
-- Current TEXT columns: complaint_description
-- Query: Search complaints by description keywords

ALTER TABLE resident_complaints 
ADD FULLTEXT INDEX ft_complaint_description (complaint_description);

-- Usage:
SELECT * FROM resident_complaints 
WHERE MATCH(complaint_description) AGAINST('garbage overflow' IN NATURAL LANGUAGE MODE);
```

**Performance:**
- Boolean mode: Phrase search with operators (+urgent -resolved)
- Natural language mode: Relevance scoring
- ~10x faster than `LIKE '%keyword%'` for large text fields

### Question Database Search

```sql
-- Admin search for quiz questions
ALTER TABLE question_db 
ADD FULLTEXT INDEX ft_question_text (question);

-- Search example:
SELECT * FROM question_db 
WHERE MATCH(question) AGAINST('+waste +segregation' IN BOOLEAN MODE);
```

---

## Partitioning Strategy

### Time-Based Partitioning

**Candidate Tables:** High-volume temporal data

**1. Attendance Records**

```sql
-- Partition by month (retain 24 months)
ALTER TABLE attendance 
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    -- ... continue monthly partitions
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Benefits:**
- Fast partition pruning (queries with date filters)
- Efficient archival (DROP PARTITION p202401 instead of DELETE)
- Parallel queries across partitions

**Maintenance Script:**

```sql
-- Add new partition for next month
ALTER TABLE attendance 
REORGANIZE PARTITION p_future INTO (
    PARTITION p202501 VALUES LESS THAN (202502),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Archive old data (keep 24 months)
ALTER TABLE attendance DROP PARTITION p202301;
```

**2. Complaints Archive**

```sql
-- Partition resolved complaints by resolution year
ALTER TABLE resident_complaints 
PARTITION BY RANGE (YEAR(updated_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_current VALUES LESS THAN MAXVALUE
);
```

**Query Optimization:**

```sql
-- Before partitioning: Full table scan
SELECT * FROM resident_complaints 
WHERE updated_at BETWEEN '2024-01-01' AND '2024-12-31';
-- Scans all 500k rows ≈ 2 seconds

-- After partitioning: Partition pruning
-- Only scans p2024 partition (~100k rows) ≈ 400ms
```

### List-Based Partitioning (Multi-Tenancy)

**For SaaS Deployments:** Partition by district/zone for tenant isolation

```sql
-- Partition complaints by district (if district_id added)
ALTER TABLE resident_complaints 
ADD COLUMN district_id INT,
ADD CONSTRAINT fk_complaints_district FOREIGN KEY (district_id) REFERENCES district(district_id);

ALTER TABLE resident_complaints 
PARTITION BY LIST (district_id) (
    PARTITION p_dist1 VALUES IN (1),
    PARTITION p_dist2 VALUES IN (2),
    PARTITION p_dist3 VALUES IN (3),
    PARTITION p_multi VALUES IN (4,5,6)
);
```

**Multi-Tenant Benefits:**
- Logical data separation per customer
- Easier compliance (GDPR right-to-erasure per district)
- Independent backup/restore per tenant

---

## Query Optimization Patterns

### 1. Avoid N+1 Queries

**Anti-Pattern:**

```javascript
// Fetch all complaints
const complaints = await db.query('SELECT * FROM resident_complaints');

// For each complaint, fetch user details (N+1 problem)
for (const complaint of complaints) {
    const user = await db.query('SELECT * FROM users WHERE user_id = ?', [complaint.user_id]);
    complaint.user = user;
}
// Total queries: 1 + N (if N=100 complaints → 101 queries)
```

**Optimized:**

```javascript
// Single JOIN query
const complaints = await db.query(`
    SELECT 
        rc.*,
        u.name AS user_name,
        u.email AS user_email
    FROM resident_complaints rc
    JOIN users u ON rc.user_id = u.user_id
`);
// Total queries: 1
```

### 2. Use Covering Indexes

**Query:**

```sql
-- Needs: user_id, name, email, role_id
SELECT user_id, name, email, role_id 
FROM users 
WHERE role_id = 2;
```

**Without Covering Index:**
1. Search `role_id` index → Find matching row IDs
2. Lookup each row in main table → Fetch name, email

**With Covering Index:**

```sql
CREATE INDEX idx_users_role_cover 
ON users(role_id, user_id, name, email);
-- All columns in index → No table lookup needed
```

**Verification:**

```sql
EXPLAIN SELECT user_id, name, email FROM users WHERE role_id = 2;
-- Extra: Using index
```

### 3. Optimize JOIN Order

**Query:**

```sql
SELECT t.*, u.name 
FROM immediate_tasks t
JOIN users u ON t.assigned_to = u.user_id
WHERE t.status = 'PENDING' AND u.role_id = 2;
```

**MySQL Optimizer Tip:** Place most restrictive table first in FROM

```sql
-- If only 10 pending tasks but 1000 trash workers:
SELECT t.*, u.name 
FROM immediate_tasks t -- Start with smaller result set
JOIN users u ON t.assigned_to = u.user_id
WHERE t.status = 'PENDING' AND u.role_id = 2;
```

**Verify Execution Plan:**

```sql
EXPLAIN SELECT ...;
-- Check rows scanned per table
```

### 4. Limit Result Sets Early

**Inefficient:**

```sql
-- Fetches all complaints, then filters in application
SELECT * FROM resident_complaints ORDER BY created_at DESC;
-- Application: complaints.slice(0, 20)
```

**Optimized:**

```sql
-- Database returns only 20 rows
SELECT * FROM resident_complaints 
ORDER BY created_at DESC 
LIMIT 20;
```

**Pagination:**

```sql
-- Offset-based (works for small offsets)
SELECT * FROM resident_complaints 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 40; -- Page 3

-- Cursor-based (better for large offsets)
SELECT * FROM resident_complaints 
WHERE created_at < '2024-01-15 10:30:00' 
ORDER BY created_at DESC 
LIMIT 20;
```

### 5. Aggregate in Database

**Inefficient:**

```javascript
// Fetch all ratings, calculate average in code
const ratings = await db.query('SELECT rating_score FROM rating WHERE worker_id = ?', [workerId]);
const avgRating = ratings.reduce((sum, r) => sum + r.rating_score, 0) / ratings.length;
```

**Optimized:**

```sql
-- Database calculates average
SELECT AVG(rating_score) AS avg_rating 
FROM rating 
WHERE worker_id = ?;
```

**Benefits:**
- Reduced network payload (1 row vs N rows)
- Database-level optimization (uses indexes)

---

## Caching Strategy

### Application-Level Cache (Redis)

**1. User Session Data**

```javascript
// Cache user role for 1 hour
redis.setex(`user:${userId}:role`, 3600, JSON.stringify(roleData));

// Middleware checks cache before DB
const cachedRole = await redis.get(`user:${userId}:role`);
if (cachedRole) return JSON.parse(cachedRole);
```

**2. Geographic Hierarchy**

```javascript
// Cache district→zone→ward tree (updates rarely)
redis.set('geo:hierarchy', JSON.stringify(hierarchyTree), 'EX', 86400);
```

**3. Dashboard Counters**

```sql
-- Expensive query (scans thousands of rows)
SELECT 
    COUNT(*) AS pending,
    COUNT(CASE WHEN complaint_status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
    COUNT(CASE WHEN complaint_status = 'RESOLVED' THEN 1 END) AS resolved
FROM resident_complaints 
WHERE user_id = ?;
```

**Cache Result:**

```javascript
// Refresh every 5 minutes
redis.setex(`dashboard:${userId}:counts`, 300, JSON.stringify(counts));
```

### Query Result Cache (MySQL)

**Enable Query Cache (MySQL 8.0 deprecated - use ProxySQL instead):**

```sql
-- For read-heavy queries with deterministic results
SELECT SQL_CACHE * FROM role; -- Roles change rarely
```

**ProxySQL Alternative:**

```sql
-- Configure ProxySQL to cache SELECT queries
cache_ttl=60 
cache_empty_result=1
```

### Materialized Views (TiDB)

**Pre-Aggregate Dashboard Data:**

```sql
-- Create summary table updated nightly
CREATE TABLE dashboard_summary AS
SELECT 
    user_id,
    COUNT(*) AS total_complaints,
    SUM(CASE WHEN complaint_status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_count,
    AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_resolution_hours
FROM resident_complaints
GROUP BY user_id;

-- Update via scheduled job
TRUNCATE dashboard_summary;
INSERT INTO dashboard_summary SELECT ... FROM resident_complaints GROUP BY user_id;
```

**Benefits:**
- Dashboard loads instantly (pre-aggregated data)
- No complex GROUP BY queries during peak hours

---

## Connection Pooling

### MySQL2 Pool Configuration

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Connection limits
    connectionLimit: 20,        // Max concurrent connections (tune based on load)
    queueLimit: 0,              // Unlimited queue (requests wait)
    
    // Timeouts
    connectTimeout: 10000,      // 10s to establish connection
    acquireTimeout: 10000,      // 10s to acquire from pool
    timeout: 30000,             // 30s query timeout
    
    // Health checks
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // Reuse connections
    waitForConnections: true
});
```

**Tuning Guidelines:**
- **Low Traffic (< 100 req/min):** connectionLimit = 5
- **Medium Traffic (100-1000 req/min):** connectionLimit = 20
- **High Traffic (> 1000 req/min):** connectionLimit = 50 + read replicas

---

## Read Replicas

### Master-Slave Replication

**Architecture:**

```
┌─────────────┐  Async Replication ┌──────────────┐
│   Master    │ ───────────────────→│  Replica 1   │ (Read-Only)
│  (Writes)   │                     └──────────────┘
└─────────────┘
       │
       └─────────────────────────────→┌──────────────┐
                                      │  Replica 2   │ (Read-Only)
                                      └──────────────┘
```

**Application Routing:**

```javascript
// Write to master
const writeResult = await masterPool.query('INSERT INTO resident_complaints ...');

// Read from replica (with replication lag tolerance)
const complaints = await replicaPool.query('SELECT * FROM resident_complaints');
```

**Replication Lag Handling:**

```javascript
// Critical read-after-write: Use master
const newComplaint = await masterPool.query('INSERT INTO resident_complaints ...');
const complaintDetails = await masterPool.query('SELECT * FROM resident_complaints WHERE complaint_id = ?', [newComplaint.insertId]);

// Non-critical read: Use replica (eventual consistency OK)
const allComplaints = await replicaPool.query('SELECT * FROM resident_complaints');
```

---

## Horizontal Scaling (Sharding)

### Shard Key Selection

**Option 1: Shard by District**

```
Shard 1: district_id IN (1, 2, 3)  → DB Server 1
Shard 2: district_id IN (4, 5, 6)  → DB Server 2
Shard 3: district_id IN (7, 8, 9)  → DB Server 3
```

**Pros:**
- Natural tenant isolation (each district is independent)
- Queries within district stay on single shard (fast)

**Cons:**
- Cross-district reports require scatter-gather queries
- Uneven shard sizes if districts have different populations

**Option 2: Shard by User ID**

```
Shard 1: user_id % 3 = 0 → DB Server 1
Shard 2: user_id % 3 = 1 → DB Server 2
Shard 3: user_id % 3 = 2 → DB Server 3
```

**Pros:**
- Balanced distribution (hash function ensures uniformity)

**Cons:**
- Cross-user queries (complaint dashboard) hit multiple shards
- Hot spot risk (influencer users with high activity)

**Recommended:** Shard by `district_id` (aligns with domain model)

### Shard Routing Table

```javascript
const SHARD_MAP = {
    1: 'mysql://shard1.example.com:3306',
    2: 'mysql://shard1.example.com:3306',
    3: 'mysql://shard1.example.com:3306',
    4: 'mysql://shard2.example.com:3306',
    5: 'mysql://shard2.example.com:3306',
    6: 'mysql://shard2.example.com:3306',
    7: 'mysql://shard3.example.com:3306',
    8: 'mysql://shard3.example.com:3306',
    9: 'mysql://shard3.example.com:3306'
};

function getShardConnection(districtId) {
    const shardUrl = SHARD_MAP[districtId];
    return mysql.createConnection(shardUrl);
}
```

---

## Monitoring & Profiling

### Slow Query Log

**Enable Logging:**

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Queries > 1 second
SET GLOBAL log_queries_not_using_indexes = 'ON';
```

**Analyze Logs:**

```bash
# Find slowest queries
mysqldumpslow -s t -t 10 /var/log/mysql/slow-query.log
```

### EXPLAIN Analysis

```sql
EXPLAIN SELECT * FROM resident_complaints WHERE complaint_status = 'PENDING';
```

**Key Columns:**
- `type`: Index scan method (ALL=bad, range=good, const=best)
- `possible_keys`: Indexes considered
- `key`: Index actually used
- `rows`: Estimated rows scanned (lower=better)
- `Extra`: Additional info (Using filesort=bad, Using index=good)

### Performance Schema

```sql
-- Enable statement instrumentation
UPDATE performance_schema.setup_instruments 
SET ENABLED='YES', TIMED='YES' 
WHERE NAME LIKE 'statement/%';

-- Top 10 slowest queries
SELECT 
    DIGEST_TEXT AS query,
    COUNT_STAR AS exec_count,
    AVG_TIMER_WAIT / 1000000000 AS avg_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_ms DESC LIMIT 10;
```

---

## Disaster Recovery

### Backup Strategy

**Daily Full Backup:**

```bash
#!/bin/bash
mysqldump --single-transaction --routines --triggers \
  --all-databases > /backups/full_$(date +%F).sql
```

**Incremental Backup (Binary Logs):**

```sql
-- Enable binary logging
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL expire_logs_days = 7;
```

**Point-in-Time Recovery:**

```bash
# Restore full backup
mysql < /backups/full_2024-01-15.sql

# Replay binary logs to specific time
mysqlbinlog --stop-datetime '2024-01-15 14:30:00' binlog.000123 | mysql
```

### High Availability (TiDB Cloud)

**Automated Failover:**
- TiDB Raft consensus (replicas across 3+ availability zones)
- Automatic leader election on node failure
- No manual intervention required

---

## Recommended Index Creation Order

**Priority 1 (Critical Performance):**

```sql
CREATE INDEX idx_complaints_route_status_created ON resident_complaints(route_id, complaint_status, created_at DESC);
CREATE INDEX idx_attendance_verification ON attendance(verified_by, att_type, created_at);
CREATE INDEX idx_tasks_worker_status_due ON immediate_tasks(assigned_to, status, due_date);
CREATE INDEX idx_otp_validation ON auth_otp(user_id, otp_type, is_used, expire_at);
```

**Priority 2 (Dashboard Optimization):**

```sql
CREATE INDEX idx_quiz_created_user_score ON quiz_management(created_at, user_id, score);
CREATE INDEX idx_rating_worker_created ON rating(worker_id, created_at);
```

**Priority 3 (Search & Analytics):**

```sql
ALTER TABLE resident_complaints ADD FULLTEXT INDEX ft_complaint_description (complaint_description);
ALTER TABLE question_db ADD FULLTEXT INDEX ft_question_text (question);
```

---

## Performance Testing Checklist

**Pre-Deployment:**
- [ ] EXPLAIN all dashboard queries (verify index usage)
- [ ] Load test authentication flows (1000 concurrent logins)
- [ ] Benchmark complaint submission (target: 100ms P99)
- [ ] Test partition pruning (queries with date filters)
- [ ] Verify connection pool size (no exhaustion under load)

**Post-Deployment:**
- [ ] Monitor slow query log (first 72 hours)
- [ ] Track query response times (Prometheus + Grafana)
- [ ] Analyze replication lag (if using replicas)
- [ ] Review index usage statistics (unused indexes = dead weight)

---

## Related Documentation

- [Architecture](./architecture.md) - High availability topology
- [Overview](./overview.md) - Scalability strategy
- [Table: resident_complaints](./tables/resident_complaints.md) - Complaint indexing details
- [Table: attendance](./tables/attendance.md) - Geo-attendance optimization
