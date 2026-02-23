# Database Architecture

![Database ERD Diagram](/img/database_diagram.png)

**Entity Relationship Diagram** showing all 22 tables across 7 functional domains.

This ERD reflects the full relational structure of the Municipal Trash Management SaaS platform.

---

## Architectural Overview

The Trash Management System database follows a **domain-driven design (DDD)** approach, organizing 22 tables into 7 cohesive business domains. The architecture emphasizes:

- **Data integrity** through strict foreign key enforcement
- **Temporal accuracy** via UTC-only timestamp storage
- **Scalability** through normalized geographic hierarchies
- **Auditability** with immutable creation timestamps
- **Security** via hashed authentication tokens

---

## Core Design Principles

### 1. Zero-Trust Authentication Model

**Implementation:**
```
Users authenticate via OTP (no password storage)
  ↓
Temporary OTP hash stored in auth_otp table
  ↓
Verification generates JWT refresh token
  ↓
Refresh token hash stored in users.refresh_token_hash
  ↓
Token rotation on every refresh (invalidates old tokens)
```

**Tables Involved:**
- `users` - Stores hashed refresh token
- `auth_otp` - Temporary OTP verification records
- `role` - Role-based permissions enforcement

**Security Features:**
- Bcrypt-hashed OTPs (never plaintext)
- Expiration enforcement (`expires_at` column)
- Single-use OTP (`is_used` flag)
- Token rotation prevents replay attacks

---

### 2. Geographic Hierarchy Model

**Four-Tier Administrative Structure:**

```
district (1)
  ├─→ zone (N)
       ├─→ ward (N)
            ├─→ ward_divisions (N)
            │    └─→ street_divisions (junction table)
            └─→ street (N)
                 └─→ street_divisions (junction table)
```

**Business Logic:**
- **District**: City-level (e.g., "North Mumbai")
- **Zone**: Administrative zones within district
- **Ward**: Smallest electoral unit (e.g., "Ward 5")
- **Division**: Operational sub-unit within ward (e.g., "Division A")
- **Street**: Individual roads mapped to divisions

**Junction Table Pattern:**

`street_divisions` implements a **many-to-many-to-many** relationship:

```sql
street_divisions
├─ division_id  → ward_divisions (defines which division)
├─ street_id    → street (defines which street)
└─ route_id     → route (defines collection route)
```

This allows:
- One street to belong to multiple divisions
- One division to contain multiple streets
- One route to cover multiple street-division pairs

---

### 3. Role-Based Access Control (RBAC)

**Role Hierarchy:**

```
ADMIN (system-wide access)
  └─→ COMMISSIONER (municipal head)
       └─→ MHO (Municipal Health Officer)
            └─→ SI (Sanitary Inspector)
                 └─→ SUPERVISOR (field supervisor)
                      └─→ TRASHMAN (collection worker)
                           └─→ RESIDENT (citizen)
```

**Permission Levels:**
| Role | Complaint Review | Task Assignment | Route Management | Quiz Creation | Attendance Approval |
|------|------------------|-----------------|------------------|---------------|---------------------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| COMMISSIONER | ✅ | ✅ | ✅ | ❌ | ✅ |
| MHO | ✅ (escalated) | ✅ | ❌ | ❌ | ✅ |
| SI | ✅ (mid-level) | ✅ | ❌ | ❌ | ✅ |
| SUPERVISOR | ✅ (first-level) | ✅ | ❌ | ❌ | ✅ |
| TRASHMAN | ❌ | ❌ (view only) | ❌ (view only) | ❌ | ❌ (submit only) |
| RESIDENT | ❌ (own only) | ❌ | ❌ | ❌ | ❌ |

**Database Implementation:**
- `role` table defines role names
- `users.role_id` foreign key enforces single role per user
- Application layer implements permission checks
- `division_officers` table maps officers to geographic divisions

---

### 4. Complaint Escalation Workflow

**Three-Level Approval Chain:**

```
1. RESIDENT submits complaint
   ├─ Status: PENDING
   ├─ Current Level: SUPERVISOR
   └─ Table: resident_complaints

2. SUPERVISOR reviews
   ├─ Accept → Assign to TRASHMAN (immediate_tasks table)
   ├─ Decline → Close or escalate to SI
   └─ Tracks accept_count / decline_count

3. SI (Sanitary Inspector) reviews escalated complaints
   ├─ Accept → Create task or close
   ├─ Decline → Escalate to MHO
   └─ Current Level: SI

4. MHO (final authority) reviews
   ├─ Accept → Force-resolve or reassign
   ├─ Decline → Mark as REJECTED
   └─ Current Level: MHO
```

**State Transitions:**

```sql
-- Valid status transitions
PENDING → IN_PROGRESS (task assigned)
IN_PROGRESS → RESOLVED (task completed)
PENDING → REJECTED (declined at all levelsfatal)
RESOLVED → IN_PROGRESS (reopened by MHO)
```

**Escalation Logic:**
- `current_level` enum tracks which role should review next
- `accept_count` and `decline_count` enable voting mechanisms
- `complaint_status` represents external-facing state

---

### 5. Assignment & Routing Model

**Route → Assignment → Worker Flow:**

```
1. route table defines collection schedules
   ├─ route_id (PK)
   ├─ start_time, end_time (operational window)
   └─ is_active (enable/disable routes)

2. street_divisions links routes to geography
   ├─ Connects: division + street + route
   └─ Allows multi-route coverage per street

3. trashman_assignment maps workers to routes
   ├─ route_id → which route
   ├─ user_id → which worker (role_id must be TRASHMAN)
   ├─ assigned_at → timestamp of assignment
   └─ is_active → enable/disable assignment
```

**Business Rules:**
- One worker can have multiple active assignments
- One route can have multiple workers (team-based collection)
- Inactive routes prevent new assignments but preserve historical data
- `assigned_at` provides assignment history audit trail

**Query Pattern Example:**
```sql
-- Find all workers assigned to a specific street
SELECT u.first_name, u.last_name, r.route_name
FROM users u
JOIN trashman_assignment ta ON u.user_id = ta.user_id
JOIN route r ON ta.route_id = r.route_id
JOIN street_divisions sd ON r.route_id = sd.route_id
JOIN street s ON sd.street_id = s.street_id
WHERE s.street_name = 'Main Street'
  AND ta.is_active = 1
  AND r.is_active = 1;
```

---

### 6. Attendance Verification System

**Dual-Mode Attendance:**

**Mode 1: GEO_SELFIE (Image-Based)**
```
1. Worker uploads selfie with GPS coordinates
   └─ Stored in geo_attendance.geo_img (Cloudinary URL)

2. Supervisor reviews image
   ├─ Verifies: Face match + location proximity
   └─ Sets attendance.is_verified = 1

3. Record linked via attendance.att_id
```

**Mode 2: MANUAL (Supervisor-Entered)**
```
1. Supervisor manually marks attendance
   ├─ No geo_attendance record created
   └─ attendance.is_verified = 1 (auto-verified)

2. Supervisor ID stored in verified_by column
```

**Tables Structure:**
```
attendance (base record)
├─ user_id → worker being marked present
├─ att_type → 'GEO_SELFIE' or 'MANUAL'
├─ is_verified → approval flag
├─ verified_by → supervisor who approved
└─ created_at → clock-in timestamp

geo_attendance (image proof)
├─ att_id → links to attendance record
└─ geo_img → Cloudinary URL
```

**Business Rules:**
- GEO_SELFIE requires supervisor verification
- MANUAL is pre-verified (supervisor-initiated)
- `user_role` column (no FK) stores role_id for analytics
- `verified_by` must be a user with SUPERVISOR+ permissions

---

### 7. Quiz Certification Architecture

**Four-Table Quiz System:**

```
1. question_db (question pool)
   ├─ Multiple-choice questions (A/B/C/D)
   └─ Correct answer marked

2. quiz_total_score_time (quiz configuration)
   ├─ total_time (e.g., 15 minutes)
   ├─ total_score (e.g., 20 questions)
   ├─ pass_mark (e.g., 12 correct = 60%)
   └─ total_questions (question count)

3. quiz_management (user quiz session)
   ├─ user_id → test-taker
   ├─ score_time_id → quiz config
   ├─ created_at → start time (UTC)
   ├─ finishes_at → deadline (created_at + total_time)
   ├─ completed_at → submission time (NULL until submitted)
   ├─ score → final grade
   ├─ is_pass → pass/fail flag
   ├─ certificate_url → PDF URL (generated on pass)
   └─ has_completed → submission flag

4. quiz_history (answer tracking)
   ├─ quiz_id → session reference
   ├─ question_id → which question
   ├─ correct_answer → copied from question_db
   ├─ user_answer → user's selection (nullable)
   └─ is_marked → flagged for review
```

**Workflow Sequence:**

```
1. User starts quiz
   ├─ INSERT INTO quiz_management (created_at = UTC_TIMESTAMP())
   ├─ Calculate finishes_at = created_at + total_time
   └─ Generate quiz_history records (one per question)

2. User answers questions
   └─ UPDATE quiz_history SET user_answer = 'B' WHERE history_id = ?

3. User marks questions for review
   └─ UPDATE quiz_history SET is_marked = 1 WHERE history_id = ?

4. Quiz submission (manual or auto on timeout)
   ├─ UPDATE quiz_management SET completed_at = UTC_TIMESTAMP()
   ├─ Calculate score (COUNT correct answers)
   ├─ Check pass/fail (score >= pass_mark)
   ├─ Generate PDF certificate if passed
   └─ UPDATE quiz_management SET certificate_url = ?
```

**Time Enforcement:**
- `finishes_at` is calculated on quiz start (immutable deadline)
- Backend auto-submits if user exceeds `finishes_at`
- Frontend countdown timer syncs with `finishes_at - UTC_TIMESTAMP()`

**Certificate Generation:**
- Only generated if `is_pass = 1`
- PDF created server-side (PDFKit + Canvas)
- Uploaded to Cloudinary
- URL permanently stored in `certificate_url`

---

### 8. Rating & Feedback System

**Bi-Directional Rating Model:**

```
Resident ←→ Trash Worker (mutual ratings)
  │
  └─→ Secured by QR Code or OTP
```

**Two-Table Architecture:**

```
1. rating (core rating record)
   ├─ from_user_id → rater
   ├─ to_user_id → ratee
   ├─ to_rating_id → ratee's role_id (for filtering)
   ├─ rating → integer score (1-5)
   ├─ description → text feedback
   ├─ rating_method → 'QR' or 'OTP'
   └─ created_at → rating timestamp

2. rating_auth (verification session)
   ├─ rating_id → links to rating record
   ├─ qr_hash → SHA-256 hash of QR data
   ├─ otp_hash → Bcrypt hash of OTP code
   ├─ created_at → session start
   ├─ expire_at → session deadline
   └─ rating_given_at → when rating submitted
```

**QR-Based Rating Flow:**
```
1. Worker generates QR session
   ├─ Backend creates rating_auth record
   ├─ qr_hash = SHA256(random_token)
   └─ expire_at = created_at + 24 hours

2. Resident scans QR code
   ├─ Frontend decodes QR to extract token
   └─ Backend verifies: SHA256(token) == qr_hash

3. Resident submits rating
   ├─ INSERT INTO rating (...)
   └─ UPDATE rating_auth SET rating_given_at = UTC_TIMESTAMP()
```

**OTP-Based Rating Flow:**
```
1. Worker requests OTP session
   ├─ Backend generates 6-digit code
   ├─ otp_hash = Bcrypt(code)
   └─ Sends OTP to resident's phone/email

2. Resident enters OTP
   └─ Backend verifies: Bcrypt.compare(input, otp_hash)

3. Resident submits rating (same as QR flow)
```

**Business Rules:**
- One rating session per worker-resident interaction
- Session expires after 24 hours (configurable)
- `rating_given_at` prevents duplicate ratings
- `to_rating_id` enables role-specific analytics (e.g., average rating for TRASHMAN role)

---

## Data Flow Diagrams

### User Registration Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/auth/request-otp
       ↓
┌─────────────────────────────────┐
│  1. Check if email exists       │
│     in users table              │
└──────┬──────────────────────────┘
       │
       ├─ Exists → Send OTP for login
       │            ↓
       │     ┌──────────────────────┐
       │     │  INSERT INTO auth_otp │
       │     │  - identifier = email │
       │     │  - otp_hash = Bcrypt  │
       │     │  - expires_at = +10min│
       │     └──────────────────────┘
       │
       └─ Not Exists → Send OTP for signup
                    ↓
             ┌──────────────────────┐
             │  INSERT INTO users    │
             │  - email (unique)     │
             │  - role_id = RESIDENT │
             │  - has_completed = 0  │
             └──────────────────────┘
                    ↓
             ┌──────────────────────┐
             │  INSERT INTO auth_otp │
             └──────────────────────┘
```

---

### Complaint Lifecycle

```
┌──────────┐       ┌─────────────────────┐       ┌────────────────┐
│ RESIDENT │───────│ resident_complaints │───────│ immediate_tasks│
└──────────┘       └─────────────────────┘       └────────────────┘
     │                       │                            │
     │ Submit complaint      │                            │
     ├──────────────────────→│                            │
     │                       │ Status: PENDING            │
     │                       │ Level: SUPERVISOR          │
     │                       │                            │
     │                  ┌────┴─────────────┐             │
     │                  │  SUPERVISOR      │             │
     │                  │  Reviews         │             │
     │                  └────┬─────────────┘             │
     │                       │                            │
     │                  Accept? ────────────────────────→ │
     │                       │         (creates task)     │
     │                       │                            │
     │                  Decline? → Escalate to SI         │
     │                       │     (current_level = SI)   │
     │                       │                            │
     │                  ┌────┴──────────────┐            │
     │                  │  SI Reviews       │            │
     │                  └────┬──────────────┘            │
     │                       │                            │
     │                  Decline? → Escalate to MHO       │
     │                       │     (current_level = MHO)  │
     │                       │                            │
     │                  ┌────┴──────────────┐            │
     │                  │  MHO Final Call   │            │
     │                  └────┬──────────────┘            │
     │                       │                            │
     │                  Accept/Reject final              │
     │                       │                            │
     └───────────────────────┴────────────────────────────┘
```

---

### Route Assignment Hierarchy

```
                    ┌──────────────┐
                    │   district   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │     zone     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │     ward     │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │                               │
    ┌──────▼───────┐              ┌───────▼──────┐
    │ward_divisions│              │    street    │
    └──────┬───────┘              └───────┬──────┘
           │                               │
           └───────────┬───────────────────┘
                       │
                ┌──────▼────────────┐
                │ street_divisions  │ ←─── Assigns route
                └──────┬────────────┘
                       │
                ┌──────▼────────────┐
                │      route        │
                └──────┬────────────┘
                       │
            ┌──────────▼─────────────┐
            │ trashman_assignment    │ ←─── Assigns worker
            └──────────┬─────────────┘
                       │
                ┌──────▼──────┐
                │    users    │ (role = TRASHMAN)
                └─────────────┘
```

---

## Schema Normalization

### Normal Forms Compliance

**First Normal Form (1NF):** ✅
- All tables have primary keys
- No repeating groups
- Atomic column values (no arrays or JSON)

**Second Normal Form (2NF):** ✅
- All non-key columns depend on entire primary key
- No partial dependencies exist

**Third Normal Form (3NF):** ✅
- No transitive dependencies
- Example: `users.district` references `district.district_name` indirectly

**Boyce-Codd Normal Form (BCNF):** ✅
- All determinants are candidate keys
- No redundant functional dependencies

**Denormalization Decisions:**

Intentionally denormalized fields for performance:

1. `users.district`, `users.ward_name`, `users.street_name` (stored as TEXT)
   - **Reason:** Avoids 3-table JOIN on every user profile fetch
   - **Trade-off:** Manual sync required if geographic names change
   - **Mitigation:** `last_address_change` timestamp tracks stale data

2. `resident_complaints.accept_count`, `decline_count`
   - **Reason:** Avoids COUNT() aggregation on every complaint view
   - **Trade-off:** Must increment atomically in transactions
   - **Mitigation:** Application-level consistency enforcement

3. `quiz_history.correct_answer` (duplicated from `question_db`)
   - **Reason:** Preserves answer key even if question is edited
   - **Trade-off:** ~4 bytes × 20 questions × N quizzes storage cost
   - **Benefit:** Immutable quiz history for certification audits

---

## Referential Integrity

### Foreign Key Cascade Behavior

**Default Strategy: RESTRICT**

All foreign keys use `ON DELETE RESTRICT` unless otherwise noted. This prevents accidental data loss.

**Recommended CASCADE Exceptions:**

```sql
-- Implement these for production:

ALTER TABLE geo_attendance 
ADD CONSTRAINT fk_geo_att 
FOREIGN KEY (att_id) REFERENCES attendance(att_id)
ON DELETE CASCADE; -- Delete image when attendance deleted

ALTER TABLE quiz_history
ADD CONSTRAINT fk_quiz_history
FOREIGN KEY (quiz_id) REFERENCES quiz_management(quiz_id)
ON DELETE CASCADE; -- Delete answers when quiz deleted

ALTER TABLE auth_otp
ADD CONSTRAINT fk_auth_otp_cleanup
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE SET NULL; -- Allow user deletion without OTP cleanup
```

**Circular Reference Handling:**

`attendance.verified_by` → `users.user_id` creates potential for circular dependencies. Resolution:

```sql
-- verified_by is nullable
-- No cascade needed; supervisor deletion blocked if they verified attendance
-- Alternative: Use soft deletes for supervisors
```

---

## Indexing Strategy

### Current Indexes (Required for Production)

**Primary Keys (auto-indexed):**
All `*_id` columns with `BIGINT PK` designation.

**Unique Constraints:**
- `users.email` - Sparse index (nullable)
- `users.phone_number` - Sparse index (nullable)
- `district.district_name` - Unique enforced

**Recommended Composite Indexes:**

```sql
-- Authentication queries (high frequency)
CREATE INDEX idx_auth_otp_lookup 
ON auth_otp(identifier, expires_at, is_used);

-- User dashboard (complaint history)
CREATE INDEX idx_complaint_user_status
ON resident_complaints(user_id, complaint_status, created_at DESC);

-- Quiz history pagination
CREATE INDEX idx_quiz_user_created
ON quiz_management(user_id, created_at DESC);

-- Attendance date range queries
CREATE INDEX idx_attendance_user_date
ON attendance(user_id, created_at);

-- Active route assignments
CREATE INDEX idx_assignment_active
ON trashman_assignment(route_id, is_active, assigned_at);

-- Geographic lookups
CREATE INDEX idx_street_ward
ON street(ward_id, street_name);

CREATE INDEX idx_ward_zone
ON ward(zone_id, ward_number);

-- Rating analytics
CREATE INDEX idx_rating_to_user
ON rating(to_user_id, to_rating_id, created_at);
```

---

## Multi-Tenancy Considerations

### Current State: Single-Tenant

The schema supports one municipal organization per database instance.

### Future Multi-Tenant Migration Path

To support multiple cities/organizations:

```sql
-- Add organization table
CREATE TABLE organization (
    org_id BIGINT PRIMARY KEY,
    org_name VARCHAR(255),
    subdomain VARCHAR(100) UNIQUE,
    created_at DATETIME
);

-- Add org_id to tenant-scoped tables
ALTER TABLE district ADD COLUMN org_id BIGINT AFTER district_id;
ALTER TABLE users ADD COLUMN org_id BIGINT AFTER user_id;
ALTER TABLE route ADD COLUMN org_id BIGINT AFTER route_id;

-- Update all foreign keys to composite keys
-- Example:
ALTER TABLE users 
ADD CONSTRAINT fk_users_role 
FOREIGN KEY (org_id, role_id) 
REFERENCES role(org_id, role_id);
```

**Tenant Isolation:**
- All queries filter by `org_id`
- Connection pools per organization
- Separate Cloudinary folders per org

---

## High-Availability Architecture

### Recommended Deployment Topology

```
                     ┌─────────────────┐
                     │  Load Balancer  │
                     └────────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              │                               │
       ┌──────▼─────┐                  ┌──────▼─────┐
       │  App Node 1│                  │  App Node 2│
       └──────┬─────┘                  └──────┬─────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                     ┌────────▼────────┐
                     │  Primary DB     │ ←──── Writes
                     │  (Master)       │
                     └────────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              │                               │
       ┌──────▼─────┐                  ┌──────▼─────┐
       │  Replica 1 │                  │  Replica 2 │
       │  (Reads)   │                  │ (Analytics)│
       └────────────┘                  └────────────┘
```

**Connection Pooling:**
```javascript
// Node.js MySQL2 example
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'trash_management_test',
    connectionLimit: 100,
    queueLimit: 0,
    waitForConnections: true,
    timezone: '+00:00' // Enforce UTC
});
```

---

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

**Target:** 1 hour maximum downtime

### Recovery Point Objective (RPO)

**Target:** 15 minutes data loss maximum

### Backup Schedule

```
Daily: 2:00 AM UTC (full backup)
Hourly: :00 minutes (incremental)
Transaction logs: Real-time replication
```

### Restoration Procedure

```bash
# 1. Restore full backup (most recent before incident)
mysql -u root -p trash_management_test < backup_2026-02-21_02-00.sql

# 2. Apply hourly incrementals
mysql -u root -p trash_management_test < incremental_2026-02-21_03-00.sql
mysql -u root -p trash_management_test < incremental_2026-02-21_04-00.sql

# 3. Replay binary logs
mysqlbinlog --start-datetime="2026-02-21 04:00:00" binlog.000123 | mysql -u root -p

# 4. Verify data integrity
SELECT COUNT(*) FROM users; -- Check critical tables
SELECT MAX(created_at) FROM attendance; -- Verify latest records
```

---

## Monitoring & Alerts

### Key Metrics to Track

**Database Health:**
- Connection pool usage (alert if >80%)
- Query latency (P95 < 50ms for SELECT, < 200ms for INSERT)
- Replication lag (alert if >10 seconds)
- Disk usage (alert if >85%)

**Business Metrics:**
- OTP failures (alert if >5% failure rate)
- Complaint escalations (alert if >20% escalate to MHO)
- Quiz pass rate (alert if &lt;50% pass rate)
- Attendance verification delays (alert if >24 hours unverified)

**Security Metrics:**
- Failed login attempts (>5 in 10 minutes from same IP)
- Unusual query patterns (DML outside business hours)
- Schema changes (audit trail required)

---

## Best Practices Summary

### Do's ✅
- Always use `UTC_TIMESTAMP()` for inserts
- Validate foreign keys before inserts (avoid integrity errors)
- Use prepared statements (prevent SQL injection)
- Index all foreign key columns
- Archive old data quarterly
- Encrypt PII columns (TDE or application-level)

### Don'ts ❌
- Never store passwords in plaintext
- Don't perform bulk deletes without transactions
- Avoid SELECT * in production queries
- Don't bypass foreign key constraints
- Never hardcode timezone conversions

---

## Related Documentation

- **[Enums Reference](./enums.md)** - Complete enum value specifications
- **[Performance Tuning](./performance.md)** - Query optimization guide
- **[Domain Models](./domains/)** - Business logic workflows
- **[Table Schemas](./tables/)** - Column-level specifications
