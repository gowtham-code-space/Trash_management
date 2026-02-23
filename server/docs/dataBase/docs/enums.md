# Enum Reference

This document provides comprehensive specifications for all enumerated types in the Trash Management System database. Enums enforce data integrity by restricting column values to predefined sets, enabling state machines and workflow validations.

---

## Overview

**Total Enums:** 8 distinct enumerated types  
**Tables Using Enums:** 9 tables  
**Purpose:** State management, role-based access control, workflow orchestration

---

## `role_name` (Table: `role`)

**Column:** `role.role_name`  
**Type:** `ENUM`  
**Values:** 7 distinct roles

### Enum Values

| Value | Numeric Representation | Description | Access Level |
|-------|------------------------|-------------|--------------|
| `RESIDENT` | Typically `role_id = 1` | Regular citizens using waste management services | Lowest |
| `TRASHMAN` | Typically `role_id = 2` | Waste collection field workers | Worker |
| `SUPERVISOR` | Typically `role_id = 3` | Field supervisors managing trash workers | First-line management |
| `SI` | Typically `role_id = 4` | Sanitary Inspectors monitoring hygiene compliance | Mid-level authority |
| `MHO` | Typically `role_id = 5` | Municipal Health Officers overseeing operations | Senior authority |
| `COMMISSIONER` | Typically `role_id = 6` | Municipal commissioners (top administrative level) | Executive |
| `ADMIN` | Typically `role_id = 7` | System administrators with full access | Superuser |

### Business Logic

**Role Hierarchy (Ascending Authority):**
```
RESIDENT < TRASHMAN < SUPERVISOR < SI < MHO < COMMISSIONER < ADMIN
```

**Permission Matrix:**

| Capability | RESIDENT | TRASHMAN | SUPERVISOR | SI | MHO | COMMISSIONER | ADMIN |
|------------|----------|----------|------------|----|----|--------------|-------|
| Submit complaints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View complaint dashboard | Own only | Own + assigned | Division | Zone | District | City-wide | All |
| Approve complaints (Level 1) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve complaints (Level 2 - SI escalation) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Approve complaints (Level 3 - MHO final) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Assign tasks | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Verify attendance | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage routes | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create quiz questions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modify schema | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**State Transitions:**

Role changes are **permanent** and require backend intervention:

```sql
-- Promote trash worker to supervisor
UPDATE users 
SET role_id = (SELECT role_id FROM role WHERE role_name = 'SUPERVISOR')
WHERE user_id = ? AND role_id = (SELECT role_id FROM role WHERE role_name = 'TRASHMAN');
```

**Validation Rules:**
- Cannot skip hierarchy levels (e.g., RESIDENT → SUPERVISOR without TRASHMAN intermediary)
- Role downgrades require ADMIN approval
- Each user has exactly one role (foreign key constraint)

**Database Column:**
```sql
role.role_name ENUM('RESIDENT','TRASHMAN','SUPERVISOR','SI','MHO','COMMISSIONER','ADMIN')
```

---

## `otp_type` (Table: `auth_otp`)

**Column:** `auth_otp.otp_type`  
**Type:** `ENUM`  
**Values:** 1 type (extensible)

### Enum Values

| Value | Description | Delivery Method | Use Case |
|-------|-------------|-----------------|----------|
| `EMAIL` | Email-based OTP | SMTP via Nodemailer | Authentication, email verification |

### Future Extensions

**Planned Values:**
```sql
-- Extend enum for future SMS/WhatsApp support
ALTER TABLE auth_otp 
MODIFY COLUMN otp_type ENUM('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');
```

### Business Logic

**OTP Lifecycle:**

```
1. User requests OTP
   ↓
2. Backend generates 6-digit code
   ↓
3. Store Bcrypt hash in auth_otp
   ↓
4. Send code via EMAIL channel
   ↓
5. User enters code (10-minute expiry window)
   ↓
6. Backend verifies hash
   ↓
7. Mark is_used = 1 (prevent reuse)
```

**Validation Rules:**
- OTP type determines `identifier` format:
  - `EMAIL` → `identifier` must be valid email address
  - (Future) `SMS` → `identifier` must be E.164 phone number
- Each OTP type may have different expiry windows

**Database Column:**
```sql
auth_otp.otp_type ENUM('EMAIL')
```

---

## `att_type` (Table: `attendance`)

**Column:** `attendance.att_type`  
**Type:** `ENUM`  
**Values:** 2 modes

### Enum Values

| Value | Description | Verification Required | Image Required |
|-------|-------------|----------------------|----------------|
| `GEO_SELFIE` | Worker uploads geo-tagged selfie | ✅ (supervisor approval) | ✅ (Cloudinary URL) |
| `MANUAL` | Supervisor manually marks attendance | ❌ (pre-verified) | ❌ (no image) |

### Business Logic

**GEO_SELFIE Workflow:**

```
1. Worker uploads selfie via mobile app
   ↓
2. Frontend captures GPS coordinates
   ↓
3. Image uploaded to Cloudinary
   ↓
4. INSERT INTO attendance (att_type = 'GEO_SELFIE', is_verified = 0)
   ↓
5. INSERT INTO geo_attendance (att_id, geo_img = <URL>)
   ↓
6. Supervisor reviews image
   ↓
7. UPDATE attendance SET is_verified = 1, verified_by = <supervisor_id>
```

**MANUAL Workflow:**

```
1. Supervisor opens attendance management UI
   ↓
2. SELECT workers assigned to current division
   ↓
3. Mark worker as present
   ↓
4. INSERT INTO attendance (att_type = 'MANUAL', is_verified = 1, verified_by = <self>)
   ↓
5. No geo_attendance record created
```

**State Transitions:**

| Initial State | Allowed Transitions | Trigger |
|---------------|---------------------|---------|
| `GEO_SELFIE` + `is_verified = 0` | → `is_verified = 1` | Supervisor approval |
| `GEO_SELFIE` + `is_verified = 0` | → DELETE record | Rejection (photo mismatch) |
| `MANUAL` + `is_verified = 1` | No transitions | Immutable once created |

**Validation Rules:**
- `GEO_SELFIE` → Must have corresponding `geo_attendance` record
- `MANUAL` → Must have `verified_by` = supervisor user_id
- Cannot change `att_type` after creation (immutable)

**Database Column:**
```sql
attendance.att_type ENUM('GEO_SELFIE','MANUAL')
```

---

## `complaint_status` (Table: `resident_complaints`)

**Column:** `resident_complaints.complaint_status`  
**Type:** `ENUM`  
**Values:** 4 states

### Enum Values

| Value | Description | Visibility | Next States |
|-------|-------------|------------|-------------|
| `PENDING` | Complaint submitted, awaiting review | Supervisor+ | `IN_PROGRESS`, `REJECTED` |
| `IN_PROGRESS` | Task assigned to worker, work underway | All roles | `RESOLVED`, `PENDING` (rollback) |
| `RESOLVED` | Issue fixed and verified | All roles | `IN_PROGRESS` (reopened) |
| `REJECTED` | Complaint declined at all escalation levels | All roles | Terminal state |

### State Machine Diagram

```
        [RESIDENT SUBMITS]
                ↓
           ┌─────────────┐
           │   PENDING   │ ←──────────────┐
           └──────┬──────┘                │
                  │                       │
       ┌──────────┼──────────┐            │
       │                     │            │
    Accept?              Decline?         │
       │                     │            │
       ↓                     ↓            │
┌──────────────┐      ┌──────────────┐   │
│ IN_PROGRESS  │      │   REJECTED   │   │
└──────┬───────┘      └──────────────┘   │
       │                  (TERMINAL)      │
       │                                  │
  Task Complete?                          │
       │                                  │
       ↓                                  │
┌──────────────┐                          │
│   RESOLVED   │                          │
└──────┬───────┘                          │
       │                                  │
   Reopened? ────────────────────────────┘
```

### Business Logic

**PENDING State:**
- Entry point for all new complaints
- `current_level` determines which role reviews next
- Accept → Create `immediate_tasks` record AND transition to `IN_PROGRESS`
- Decline → Escalate to next level OR mark `REJECTED` if final level

**IN_PROGRESS State:**
- Task exists in `immediate_tasks` table
- Worker assigned (`assigned_to` column)
- Task status tracked separately in `immediate_tasks.status`
- Completion → Transition to `RESOLVED`

**RESOLVED State:**
- Complaint addressed and closed
- Can be reopened by MHO/COMMISSIONER if issue recurs
- Reopening creates new `immediate_tasks` record

**REJECTED State:**
- Terminal state (no further transitions)
- Occurs when complaint declined at all approval levels
- Requires manual intervention to reverse

**Escalation Logic:**

```sql
-- Supervisor declines → Escalate to SI
IF current_level = 'SUPERVISOR' AND decision = 'DECLINE' THEN
    UPDATE resident_complaints 
    SET current_level = 'SI', decline_count = decline_count + 1
    WHERE complaint_id = ?;
END IF;

-- SI declines → Escalate to MHO
IF current_level = 'SI' AND decision = 'DECLINE' THEN
    UPDATE resident_complaints 
    SET current_level = 'MHO', decline_count = decline_count + 1
    WHERE complaint_id = ?;
END IF;

-- MHO declines → Final rejection
IF current_level = 'MHO' AND decision = 'DECLINE' THEN
    UPDATE resident_complaints 
    SET complaint_status = 'REJECTED', decline_count = decline_count + 1
    WHERE complaint_id = ?;
END IF;
```

**Validation Rules:**
- Only roles ≥ `current_level` can modify complaint
- `IN_PROGRESS` requires at least one `immediate_tasks` record
- `RESOLVED` requires task completion proof (future webhook integration)
- Cannot transition from `REJECTED` without ADMIN override

**Database Column:**
```sql
resident_complaints.complaint_status ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED')
```

---

## `current_level` (Table: `resident_complaints`)

**Column:** `resident_complaints.current_level`  
**Type:** `ENUM`  
**Values:** 3 escalation levels

### Enum Values

| Value | Role Required | Escalation Order | Final Authority |
|-------|---------------|------------------|-----------------|
| `SUPERVISOR` | Supervisor | Level 1 (initial) | No |
| `SI` | Sanitary Inspector | Level 2 (first escalation) | No |
| `MHO` | Municipal Health Officer | Level 3 (final escalation) | Yes |

### Business Logic

**Escalation Chain:**

```
Complaint Created
      ↓
current_level = 'SUPERVISOR'
      ↓
   Declined?
      ↓
current_level = 'SI'
      ↓
   Declined?
      ↓
current_level = 'MHO'
      ↓
  FINAL DECISION
```

**Role Access Control:**

```javascript
// Backend middleware example
function canReviewComplaint(userRole, complaintLevel) {
    const rolePriority = {
        'SUPERVISOR': 1,
        'SI': 2,
        'MHO': 3,
        'COMMISSIONER': 4,
        'ADMIN': 5
    };
    
    const levelPriority = {
        'SUPERVISOR': 1,
        'SI': 2,
        'MHO': 3
    };
    
    return rolePriority[userRole] >= levelPriority[complaintLevel];
}
```

**Voting Mechanism:**

- `accept_count`: Incremented on approval
- `decline_count`: Incremented on rejection
- If majority votes (>50%) decline → Escalate
- If majority accept → Create task

**Validation Rules:**
- Cannot skip levels (SUPERVISOR → MHO without SI)
- MHO decisions are final (no further escalation)
- Only users with `role_id` ≥ current level can review
- Level resets to SUPERVISOR if complaint reopened

**Database Column:**
```sql
resident_complaints.current_level ENUM('SUPERVISOR','SI','MHO')
```

---

## `status` (Table: `immediate_tasks`)

**Column:** `immediate_tasks.status`  
**Type:** `ENUM`  
**Values:** 3 task states

### Enum Values

| Value | Description | Worker Action | Next States |
|-------|-------------|---------------|-------------|
| `PENDING` | Task assigned but not started | View task details | `IN_PROGRESS` |
| `IN_PROGRESS` | Worker actively working on task | Update progress | `COMPLETED` |
| `COMPLETED` | Task finished and verified | Submit completion proof | Terminal |

### Business Logic

**Task Lifecycle:**

```
Complaint Approved (complaint_status = IN_PROGRESS)
      ↓
INSERT INTO immediate_tasks (status = 'PENDING')
      ↓
Worker Starts Task
      ↓
UPDATE status = 'IN_PROGRESS'
      ↓
Worker Completes Work
      ↓
UPDATE status = 'COMPLETED'
      ↓
Supervisor Verifies
      ↓
UPDATE complaint_status = 'RESOLVED'
```

**State Transitions:**

| From | To | Trigger | Validation |
|------|-----|---------|-----------|
| `PENDING` | `IN_PROGRESS` | Worker accepts task | Worker must be `assigned_to` user |
| `IN_PROGRESS` | `COMPLETED` | Worker submits completion | Image/proof upload required |
| `COMPLETED` | `IN_PROGRESS` | Supervisor rejects completion | Must provide rejection reason |
| `PENDING` | DELETE | Complaint closed without work | Only SUPERVISOR+ can delete |

**Completion Proof:**

```sql
-- Add completion metadata (extend schema)
ALTER TABLE immediate_tasks 
ADD COLUMN completion_image VARCHAR(255),
ADD COLUMN completion_notes TEXT,
ADD COLUMN completed_at DATETIME;
```

**Validation Rules:**
- Only `assigned_to` worker can update own task status
- `COMPLETED` requires completion_image AND completion_notes
- Cannot mark `COMPLETED` without visiting location (geo-fence validation recommended)
- Supervisor can override status at any time

**Database Column:**
```sql
immediate_tasks.status ENUM('PENDING','IN_PROGRESS','COMPLETED')
```

---

## `correct_option` & `user_answer` (Tables: `question_db`, `quiz_history`)

**Columns:**  
- `question_db.correct_option`  
- `quiz_history.correct_answer` (copy of correct_option)  
- `quiz_history.user_answer`

**Type:** `ENUM`  
**Values:** 4 multiple-choice options

### Enum Values

| Value | Description | Option Column |
|-------|-------------|---------------|
| `A` | First option | `question_db.option_a` |
| `B` | Second option | `question_db.option_b` |
| `C` | Third option | `question_db.option_c` |
| `D` | Fourth option | `question_db.option_d` |

### Business Logic

**Question Storage:**

```sql
-- Example question
INSERT INTO question_db (
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option
) VALUES (
    'What is proper waste segregation?',
    'Mix all waste together',
    'Separate dry and wet waste',
    'Only dry waste matters',
    'No segregation needed',
    'B' -- Correct answer
);
```

**Quiz Answer Tracking:**

```sql
-- When quiz starts, copy correct answer to history
INSERT INTO quiz_history (quiz_id, question_id, correct_answer, user_answer)
SELECT ?, question_id, correct_option, NULL
FROM question_db
ORDER BY RAND() LIMIT 20; -- 20 random questions

-- User selects answer
UPDATE quiz_history 
SET user_answer = 'B' 
WHERE history_id = ?;

-- Calculate score on submission
SELECT COUNT(*) 
FROM quiz_history 
WHERE quiz_id = ? AND correct_answer = user_answer;
```

**Answer Immutability:**

- `correct_answer` copied to `quiz_history` on quiz start
- Even if admin edits question in `question_db`, historical quiz remains unchanged
- Prevents retroactive score changes

**Validation Rules:**
- All four options (A/B/C/D) must have non-empty text
- Exactly one `correct_option` per question
- `user_answer` nullable (unanswered questions)
- Cannot change `correct_answer` in `quiz_history` after quiz submitted

**Scoring Logic:**

```javascript
function calculateScore(quizId) {
    const results = db.query(`
        SELECT 
            correct_answer,
            user_answer,
            (correct_answer = user_answer) AS is_correct
        FROM quiz_history
        WHERE quiz_id = ?
    `, [quizId]);
    
    const correctCount = results.filter(r => r.is_correct).length;
    const totalQuestions = results.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    
    return {
        score: correctCount,
        total: totalQuestions,
        percentage: scorePercentage,
        passed: scorePercentage >= 60 // Hardcoded or from quiz_total_score_time.pass_mark
    };
}
```

**Database Columns:**
```sql
question_db.correct_option ENUM('A','B','C','D')
quiz_history.correct_answer ENUM('A','B','C','D')
quiz_history.user_answer ENUM('A','B','C','D') DEFAULT NULL
```

---

## `rating_method` (Table: `rating`)

**Column:** `rating.rating_method`  
**Type:** `ENUM`  
**Values:** 2 verification methods

### Enum Values

| Value | Description | Authentication | Use Case |
|-------|-------------|----------------|----------|
| `QR` | QR code-based verification | SHA-256 hash match | In-person ratings (worker shows QR) |
| `OTP` | One-time password verification | Bcrypt hash match | Remote ratings (SMS/email OTP) |

### Business Logic

**QR-Based Rating Flow:**

```
1. Worker generates rating session
   ↓
Backend: INSERT INTO rating_auth (qr_hash = SHA256(random_token))
   ↓
Backend: Generate QR code containing token
   ↓
2. Worker shows QR to resident
   ↓
3. Resident scans QR with app
   ↓
Frontend: Decode token from QR
   ↓
4. Submit token to backend
   ↓
Backend: Verify SHA256(token) == qr_hash
   ↓
5. Show rating form if verified
   ↓
6. INSERT INTO rating (rating_method = 'QR')
```

**OTP-Based Rating Flow:**

```
1. Worker requests OTP session
   ↓
Backend: Generate 6-digit code
   ↓
Backend: INSERT INTO rating_auth (otp_hash = Bcrypt(code))
   ↓
Backend: Send OTP to resident's phone/email
   ↓
2. Resident receives OTP
   ↓
3. Resident enters OTP in app
   ↓
Backend: Verify Bcrypt.compare(input, otp_hash)
   ↓
4. Show rating form if verified
   ↓
5. INSERT INTO rating (rating_method = 'OTP')
```

**security Considerations:**

| Method | Hash Algorithm | Brute Force Risk | Token Lifetime |
|--------|----------------|------------------|----------------|
| `QR` | SHA-256 | Low (long tokens) | 24 hours |
| `OTP` | Bcrypt | Medium (6 digits) | 10 minutes |

**Validation Rules:**
- QR sessions must have `rating_auth.qr_hash` populated
- OTP sessions must have `rating_auth.otp_hash` populated
- Cannot use both QR and OTP for same rating session
- Rating submission sets `rating_auth.rating_given_at` (prevents reuse)
- Expired sessions (`expire_at < UTC_TIMESTAMP()`) rejected

**Database Column:**
```sql
rating.rating_method ENUM('QR','OTP')
```

---

## Enum Modification Guidelines

### Adding New Enum Values

**Safe Additions (Append-Only):**

```sql
-- Add new role (safe - appends to end)
ALTER TABLE role 
MODIFY COLUMN role_name ENUM(
    'RESIDENT',
    'TRASHMAN',
    'SUPERVISOR',
    'SI',
    'MHO',
    'COMMISSIONER',
    'ADMIN',
    'AUDITOR' -- NEW VALUE
);
```

**Unsafe Modifications (Never Do):**

```sql
-- ❌ WRONG: Reordering enum values breaks stored data
ALTER TABLE role 
MODIFY COLUMN role_name ENUM(
    'ADMIN', -- Moved to front - BREAKS EXISTING DATA
    'RESIDENT',
    ...
);
```

### Removing Enum Values

**Migration Strategy:**

```sql
-- 1. Find affected records
SELECT COUNT(*) FROM resident_complaints WHERE complaint_status = 'PENDING';

-- 2. Migrate data to new value
UPDATE resident_complaints 
SET complaint_status = 'AWAITING_REVIEW' 
WHERE complaint_status = 'PENDING';

-- 3. Remove enum value (after full migration)
ALTER TABLE resident_complaints 
MODIFY COLUMN complaint_status ENUM('IN_PROGRESS','RESOLVED','REJECTED','AWAITING_REVIEW');
```

---

## Enum Testing Checklist

### Pre-Deployment Validation

**For New Enum Values:**
- [ ] All application code updated to handle new value
- [ ] Frontend dropdown/select options updated
- [ ] State transition logic includes new value
- [ ] Validation rules accommodate new value
- [ ] Migration script tested on staging data

**For Enum Removals:**
- [ ] Zero records use deprecated value (verified in production)
- [ ] Backward-compatible migration script ready
- [ ] Rollback plan documented
- [ ] Dependent workflows updated

---

## Cross-Reference

**Related Documentation:**
- [Architecture](./architecture.md) - State transition diagrams
- [Domain: Complaints](./domains/complaints.md) - Complaint status lifecycle
- [Domain: User Auth](./domains/user-auth.md) - Role permissions matrix
- [Table: role](./tables/role.md) - Role management details
- [Performance](./performance.md) - Enum indexing strategies
