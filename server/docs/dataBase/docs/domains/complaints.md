# Complaint Management Domain

This domain handles resident complaint submission, multi-level escalation workflows, task assignment, and resolution tracking for the Trash Management System.

---

## Domain Overview

**Purpose:** Three-tier approval mechanism for waste management complaints with geographic routing  
**Key Feature:** Escalation chain (Supervisor → SI → MHO) with decline tracking  
**Tables:** 2 core tables (`resident_complaints`, `immediate_tasks`)  
**External Dependencies:** Geographic hierarchy (routes, wards), user authentication, Cloudinary (image uploads)

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `resident_complaints` | Complaint lifecycle management | ~50,000 complaints | +200/day |
| `immediate_tasks` | Task assignments for complaint resolution | ~30,000 tasks | +150/day |

---

## Complaint Lifecycle

### State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLAINT SUBMITTED                      │
│                  (complaint_status=PENDING)                 │
│                   (current_level=SUPERVISOR)                │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
     Approve                   Decline
        │                         │
        ↓                         ↓
┌────────────────┐      ┌──────────────────────┐
│ IN_PROGRESS    │      │ Escalate to SI       │
│ (Create Task)  │      │ current_level = SI   │
└───────┬────────┘      │ decline_count++      │
        │               └──────────┬───────────┘
        │                          │
        │               ┌──────────┴──────────┐
        │               │                     │
        │            Approve              Decline
        │               │                     │
        │               ├──→ IN_PROGRESS      ↓
        │               │                ┌──────────────────┐
        │               │                │ Escalate to MHO  │
        │               │                │ current_level=MHO│
        │               │                │ decline_count++  │
        │               │                └─────────┬────────┘
        │               │                          │
        │               │               ┌──────────┴───────┐
        │               │               │                  │
        │               │            Approve           Decline
        │               │               │                  │
        │               └───────────────┤          ┌───────────────┐
        │                               │          │   REJECTED    │
        │                               │          │  (TERMINAL)   │
        │                               │          └───────────────┘
        │                               │
        ↓                               ↓
   Task Completed               Task Completed
        │                               │
        ↓                               ↓
┌──────────────┐              ┌──────────────┐
│   RESOLVED   │              │   RESOLVED   │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ (Can be reopened by MHO+)   │
       └─────────────┬───────────────┘
                     │
                     ↓
             ┌──────────────┐
             │ IN_PROGRESS  │ (New task created)
             └──────────────┘
```

### Status Definitions

| Status | Definition | Triggers | Next States |
|--------|------------|----------|-------------|
| `PENDING` | Complaint awaiting review at `current_level` | Resident submits complaint | `IN_PROGRESS`, `PENDING` (escalated) |
| `IN_PROGRESS` | Task assigned to worker, actively being resolved | Approval at any level | `RESOLVED`, `PENDING` (rollback) |
| `RESOLVED` | Complaint addressed and closed | Task marked `COMPLETED` | `IN_PROGRESS` (reopened) |
| `REJECTED` | Declined at all escalation levels (MHO final) | MHO declines after SI/Supervisor declines | Terminal |

---

## Escalation Workflow

### Three-Level Approval Chain

**Level 1: Supervisor** (Default Entry Point)

```sql
-- Complaint created by resident
INSERT INTO resident_complaints (
    complaint_uuid, user_id, route_id, complaint_description,
    complaint_status, current_level, accept_count, decline_count
) VALUES (
    UUID(), ?, ?, ?,
    'PENDING', 'SUPERVISOR', 0, 0
);
```

**Supervisor Decision:**

```javascript
// Supervisor approves → Create task
if (decision === 'APPROVE') {
    await db.query(`
        UPDATE resident_complaints 
        SET complaint_status = 'IN_PROGRESS', accept_count = accept_count + 1
        WHERE complaint_id = ?
    `, [complaintId]);
    
    await db.query(`
        INSERT INTO immediate_tasks (task_source, assigned_to, division_id, status)
        VALUES (?, ?, ?, 'PENDING')
    `, [complaintId, workerUserId, divisionId]);
}

// Supervisor declines → Escalate to SI
if (decision === 'DECLINE') {
    await db.query(`
        UPDATE resident_complaints 
        SET current_level = 'SI', decline_count = decline_count + 1
        WHERE complaint_id = ?
    `, [complaintId]);
}
```

**Level 2: Sanitary Inspector (SI)**

```javascript
// SI approves → Create task
if (decision === 'APPROVE') {
    // Same as supervisor approval (transition to IN_PROGRESS)
}

// SI declines → Escalate to MHO
if (decision === 'DECLINE') {
    await db.query(`
        UPDATE resident_complaints 
        SET current_level = 'MHO', decline_count = decline_count + 1
        WHERE complaint_id = ?
    `, [complaintId]);
}
```

**Level 3: Municipal Health Officer (MHO) - FINAL AUTHORITY**

```javascript
// MHO approves → Create task
if (decision === 'APPROVE') {
    // Same as above (transition to IN_PROGRESS)
}

// MHO declines → Final rejection
if (decision === 'DECLINE') {
    await db.query(`
        UPDATE resident_complaints 
        SET complaint_status = 'REJECTED', decline_count = decline_count + 1
        WHERE complaint_id = ?
    `, [complaintId]);
    // No further escalation possible
}
```

### Escalation Metrics

**Tracking Columns:**
- `accept_count`: Number of approvals across all levels
- `decline_count`: Number of declines (max 3 if fully escalated)
- `current_level`: Current role responsible for review

**Example Workflow Trace:**

| Event | current_level | accept_count | decline_count | complaint_status |
|-------|---------------|--------------|---------------|------------------|
| Complaint created | SUPERVISOR | 0 | 0 | PENDING |
| Supervisor declines | SI | 0 | 1 | PENDING |
| SI declines | MHO | 0 | 2 | PENDING |
| MHO approves | MHO | 1 | 2 | IN_PROGRESS |
| Task completed | MHO | 1 | 2 | RESOLVED |

---

## Task Assignment & Resolution

### Task Creation

**Trigger:** Complaint approved at any escalation level

```sql
INSERT INTO immediate_tasks (
    task_id,
    task_source,        -- FK to resident_complaints.complaint_id
    assigned_to,        -- FK to users.user_id (TRASHMAN role)
    division_id,        -- FK to ward_divisions.division_id
    status,             -- ENUM('PENDING','IN_PROGRESS','COMPLETED')
    due_date,
    created_at
) VALUES (
    NULL,               -- Auto-increment
    123,                -- complaint_id
    456,                -- trashman_user_id
    789,                -- division_id (from complaint route)
    'PENDING',
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 DAY),
    UTC_TIMESTAMP()
);
```

**Assignment Logic:**

```javascript
// Find trashman assigned to complaint's route
const assignment = await db.query(`
    SELECT ta.user_id, sd.division_id
    FROM trashman_assignment ta
    JOIN route r ON ta.route_id = r.route_id
    JOIN street_divisions sd ON r.route_id = sd.route_id
    WHERE r.route_id = ?
    LIMIT 1
`, [complaint.route_id]);

const taskmans = assignment[0].user_id;
const divisionId = assignment[0].division_id;
```

### Task Lifecycle

**State Transitions:**

```
PENDING ──(Worker Accepts)──→ IN_PROGRESS ──(Worker Completes)──→ COMPLETED
   │                                │
   └───(Supervisor Deletes)         └───(Supervisor Rejects)──→ IN_PROGRESS (retry)
```

**Worker Actions:**

```javascript
// Worker starts task
await db.query(`
    UPDATE immediate_tasks 
    SET status = 'IN_PROGRESS', started_at = UTC_TIMESTAMP()
    WHERE task_id = ? AND assigned_to = ?
`, [taskId, workerUserId]);

// Worker completes task (with proof)
await db.query(`
    UPDATE immediate_tasks 
    SET status = 'COMPLETED', 
        completed_at = UTC_TIMESTAMP(),
        completion_image = ?,
        completion_notes = ?
    WHERE task_id = ? AND assigned_to = ?
`, [cloudinaryUrl, notes, taskId, workerUserId]);

// Update complaint status
await db.query(`
    UPDATE resident_complaints 
    SET complaint_status = 'RESOLVED', updated_at = UTC_TIMESTAMP()
    WHERE complaint_id = (
        SELECT task_source FROM immediate_tasks WHERE task_id = ?
    )
`, [taskId]);
```

---

## Geographic Routing

### Complaint-to-Route Mapping

**Workflow:**

```
Resident Selects Location
         ↓
Frontend: Geocode to lat/lng
         ↓
Backend: Find nearest route
         ↓
INSERT complaint with route_id
```

**Route Lookup Query:**

```sql
-- Find route by street (if street name provided)
SELECT r.route_id, r.route_name 
FROM route r
JOIN street s ON r.street_id = s.street_id
WHERE s.street_name = ?;

-- Find route by ward (broader search)
SELECT r.route_id, r.route_name 
FROM route r
JOIN street s ON r.street_id = s.street_id
JOIN ward w ON s.ward_id = w.ward_id
WHERE w.ward_name = ?;
```

**Geographic Hierarchy:**

```
District (City-Level)
    ↓
 Zone (Administrative Region)
    ↓
 Ward (Neighborhood)
    ↓
Street (Specific Road)
    ↓
Route (Collection Path)
```

**Complaint Dashboard Filtering:**

```javascript
// Supervisor: View complaints in assigned divisions
const complaints = await db.query(`
    SELECT rc.* 
    FROM resident_complaints rc
    JOIN route r ON rc.route_id = r.route_id
    JOIN street_divisions sd ON r.route_id = sd.route_id
    JOIN division_officers doff ON sd.division_id = doff.division_id
    WHERE doff.user_id = ? AND doff.role_type = 'SUPERVISOR'
`, [supervisorUserId]);

// MHO: View all complaints in zone
const complaints = await db.query(`
    SELECT rc.* 
    FROM resident_complaints rc
    JOIN route r ON rc.route_id = r.route_id
    JOIN street s ON r.street_id = s.street_id
    JOIN ward w ON s.ward_id = w.ward_id
    WHERE w.zone_id = ?
`, [zoneId]);
```

---

## Data Flow Diagrams

### Complaint Submission Flow

```
RESIDENT                BACKEND                  DATABASE
    │                      │                        │
    │ 1. Upload Image      │                        │
    ├────────────────────→ │                        │
    │                      │ 2. Upload to Cloudinary│
    │                      │    (external service)  │
    │                      │                        │
    │ 3. Image URL         │                        │
    │ ←────────────────────┤                        │
    │                      │                        │
    │ 4. Submit Complaint  │                        │
    │    {description,     │                        │
    │     route_id,        │                        │
    │     image_url}       │                        │
    ├────────────────────→ │                        │
    │                      │ 5. Validate route      │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM route    │
    │                      │ WHERE route_id=?       │
    │                      │←───────────────────────┤
    │                      │                        │
    │                      │ 6. INSERT complaint    │
    │                      ├───────────────────────→│
    │                      │ INSERT INTO            │
    │                      │ resident_complaints    │
    │                      │ (complaint_uuid,       │
    │                      │  user_id,              │
    │                      │  route_id,             │
    │                      │  complaint_description,│
    │                      │  proof_image,          │
    │                      │  complaint_status=     │
    │                      │   'PENDING',           │
    │                      │  current_level=        │
    │                      │   'SUPERVISOR')        │
    │                      │←───────────────────────┤
    │                      │  (complaint_id=789)    │
    │                      │                        │
    │ 7. Response          │                        │
    │    {complaint_uuid,  │                        │
    │     status: PENDING} │                        │
    │←────────────────────┤                        │
    │                      │                        │
```

### Approval & Task Assignment Flow

```
SUPERVISOR              BACKEND                  DATABASE
    │                      │                        │
    │ 1. GET complaints    │                        │
    │    WHERE current_    │                        │
    │    level=SUPERVISOR  │                        │
    ├────────────────────→ │                        │
    │                      │ 2. Fetch pending       │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM          │
    │                      │ resident_complaints    │
    │                      │ WHERE current_level=   │
    │                      │  'SUPERVISOR' AND      │
    │                      │ complaint_status=      │
    │                      │  'PENDING'             │
    │                      │←───────────────────────┤
    │ 3. Complaint list    │                        │
    │←────────────────────┤                        │
    │                      │                        │
    │ 4. APPROVE complaint │                        │
    │    {complaint_id,    │                        │
    │     assigned_to}     │                        │
    ├────────────────────→ │                        │
    │                      │ 5. Start transaction   │
    │                      │                        │
    │                      │ 6. Update complaint    │
    │                      ├───────────────────────→│
    │                      │ UPDATE resident_       │
    │                      │ complaints SET         │
    │                      │ complaint_status=      │
    │                      │  'IN_PROGRESS',        │
    │                      │ accept_count+=1        │
    │                      │ WHERE complaint_id=?   │
    │                      │←───────────────────────┤
    │                      │                        │
    │                      │ 7. Create task         │
    │                      ├───────────────────────→│
    │                      │ INSERT INTO            │
    │                      │ immediate_tasks        │
    │                      │ (task_source,          │
    │                      │  assigned_to,          │
    │                      │  division_id,          │
    │                      │  status='PENDING',     │
    │                      │  due_date=NOW()+3d)    │
    │                      │←───────────────────────┤
    │                      │  (task_id=123)         │
    │                      │                        │
    │                      │ 8. Commit transaction  │
    │                      │                        │
    │ 9. Success response  │                        │
    │←────────────────────┤                        │
    │                      │                        │
```

---

## Database Schema

### `resident_complaints` Table

```sql
CREATE TABLE resident_complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    complaint_description TEXT NOT NULL,
    proof_image VARCHAR(500),
    complaint_status ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    current_level ENUM('SUPERVISOR','SI','MHO') NOT NULL DEFAULT 'SUPERVISOR',
    accept_count INT DEFAULT 0,
    decline_count INT DEFAULT 0,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    updated_at DATETIME DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP(),
    
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_complaints_route FOREIGN KEY (route_id) REFERENCES route(route_id)
);
```

**Key Columns:**
- `complaint_uuid`: Public identifier (API responses use this, not complaint_id)
- `proof_image`: Cloudinary URL (e.g., https://res.cloudinary.com/.../garbage.jpg)
- `current_level`: Determines which role can approve/decline next
- `accept_count`/`decline_count`: Audit trail for escalation decisions

**Indexes:**

```sql
CREATE INDEX idx_complaints_route_status_created 
ON resident_complaints(route_id, complaint_status, created_at DESC);
-- Optimizes dashboard queries filtered by route and status

CREATE INDEX idx_complaints_user 
ON resident_complaints(user_id);
-- Resident's complaint history

CREATE INDEX idx_complaints_current_level 
ON resident_complaints(current_level, complaint_status);
-- Supervisor/SI/MHO review queues
```

### `immediate_tasks` Table

```sql
CREATE TABLE immediate_tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    task_source INT NOT NULL,           -- FK to resident_complaints.complaint_id
    assigned_to INT NOT NULL,           -- FK to users.user_id (TRASHMAN role)
    division_id INT NOT NULL,           -- FK to ward_divisions.division_id
    status ENUM('PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    started_at DATETIME,
    completed_at DATETIME,
    completion_image VARCHAR(500),      -- Proof of completion
    completion_notes TEXT,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    updated_at DATETIME DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP(),
    
    CONSTRAINT fk_tasks_complaint FOREIGN KEY (task_source) REFERENCES resident_complaints(complaint_id),
    CONSTRAINT fk_tasks_worker FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    CONSTRAINT fk_tasks_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id)
);
```

**Key Columns:**
- `task_source`: Links task to originating complaint (one-to-many if task rejected)
- `assigned_to`: Worker responsible for completion
- `division_id`: Geographic area (used for supervisor oversight)
- `started_at`/`completed_at`: Performance metrics (time-to-resolve)

**Indexes:**

```sql
CREATE INDEX idx_tasks_worker_status_due 
ON immediate_tasks(assigned_to, status, due_date);
-- Worker's active task queue

CREATE INDEX idx_tasks_division_status 
ON immediate_tasks(division_id, status);
-- Supervisor's division oversight

CREATE INDEX idx_tasks_source 
ON immediate_tasks(task_source);
-- Lookup tasks for specific complaint
```

---

## Business Rules

### Complaint Validation Rules

1. **Description Length:** Minimum 10 characters, maximum 1000 characters
2. **Image Upload:** Optional but recommended (stored as Cloudinary URL)
3. **Route Assignment:** Must reference valid `route_id` from route table
4. **User Authorization:** Only authenticated users can submit complaints
5. **UUID Uniqueness:** `complaint_uuid` generated server-side (UUID v4)

### Escalation Rules

1. **Maximum Escalation Levels:** 3 (Supervisor → SI → MHO)
2. **Decline Limit:** System allows max 3 declines (one per level)
3. **Approval Authority:** Any level can approve (no need to escalate to MHO if Supervisor approves)
4. **MHO Final Decision:** MHO decline results in `REJECTED` (terminal state)
5. **Reopen Policy:** Only MHO, COMMISSIONER, or ADMIN can reopen `RESOLVED` complaints

### Task Assignment Rules

1. **Worker Eligibility:** Only users with `role_id = 2` (TRASHMAN) can be assigned tasks
2. **Route Matching:** Assigned worker must have `trashman_assignment` record for complaint's route
3. **Due Date Calculation:** Default 3 days from task creation (`NOW() + INTERVAL 3 DAY`)
4. **Completion Proof:** Workers must upload `completion_image` and provide `completion_notes`

### Data Retention Rules

1. **Active Complaints:** Retained indefinitely
2. **Resolved Complaints:** Archived after 2 years (move to `complaints_archive` table)
3. **Rejected Complaints:** Retained for 1 year, then soft-deleted (`is_deleted = 1`)

---

## API Endpoints

### `POST /api/complaints`

**Request:**

```json
{
    "route_id": 123,
    "complaint_description": "Garbage overflow at street corner",
    "proof_image": "https://res.cloudinary.com/.../trash.jpg"
}
```

**Response:**

```json
{
    "complaint_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "complaint_id": 789,
    "complaint_status": "PENDING",
    "current_level": "SUPERVISOR",
    "created_at": "2024-01-15T10:30:00Z"
}
```

### `GET /api/complaints/:uuid`

**Response:**

```json
{
    "complaint_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "complaint_description": "Garbage overflow at street corner",
    "proof_image": "https://res.cloudinary.com/.../trash.jpg",
    "complaint_status": "IN_PROGRESS",
    "current_level": "SUPERVISOR",
    "accept_count": 1,
    "decline_count": 0,
    "route": {
        "route_id": 123,
        "route_name": "Main Street Route A"
    },
    "user": {
        "name": "John Doe",
        "email": "john@example.com"
    },
    "tasks": [
        {
            "task_id": 456,
            "assigned_to": {
                "name": "Worker Smith",
                "user_id": 789
            },
            "status": "IN_PROGRESS",
            "due_date": "2024-01-18"
        }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
}
```

### `PATCH /api/complaints/:uuid/approve`

**Request Headers:**

```
Authorization: Bearer <supervisor_jwt>
```

**Request Body:**

```json
{
    "assigned_to": 789,  // user_id of trashman
    "division_id": 456
}
```

**Response:**

```json
{
    "message": "Complaint approved and task created",
    "complaint_status": "IN_PROGRESS",
    "task_id": 123
}
```

### `PATCH /api/complaints/:uuid/decline`

**Request Headers:**

```
Authorization: Bearer <supervisor_jwt>
```

**Response:**

```json
{
    "message": "Complaint escalated to SI",
    "current_level": "SI",
    "decline_count": 1
}
```

---

## Performance Considerations

### Query Optimization

**Dashboard Query (Supervisor):**

```sql
-- Inefficient: Multiple JOINs without covering index
SELECT rc.*, u.name AS user_name, r.route_name 
FROM resident_complaints rc
JOIN users u ON rc.user_id = u.user_id
JOIN route r ON rc.route_id = r.route_id
WHERE rc.complaint_status = 'PENDING' AND rc.current_level = 'SUPERVISOR'
ORDER BY rc.created_at DESC
LIMIT 20;

-- Optimized with covering index (see performance.md)
CREATE INDEX idx_complaints_review_queue 
ON resident_complaints(current_level, complaint_status, created_at DESC, complaint_id);
```

**Task Lookup (Worker):**

```sql
-- Use composite index for fast filtering
SELECT * FROM immediate_tasks 
WHERE assigned_to = ? AND status != 'COMPLETED'
ORDER BY due_date ASC;

-- Index: idx_tasks_worker_status_due (already defined)
```

### Caching Strategy

**Redis Cache for Complaint Counts:**

```javascript
// Cache complaint counts per user (5-minute TTL)
const cacheKey = `complaints:counts:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const counts = await db.query(`
    SELECT 
        complaint_status,
        COUNT(*) AS count
    FROM resident_complaints
    WHERE user_id = ?
    GROUP BY complaint_status
`, [userId]);

await redis.setex(cacheKey, 300, JSON.stringify(counts));
```

---

## Audit & Compliance

### Change Tracking

**Recommended Schema (Future Enhancement):**

```sql
CREATE TABLE complaint_audit_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    changed_by INT NOT NULL,
    old_status ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED'),
    new_status ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED'),
    old_level ENUM('SUPERVISOR','SI','MHO'),
    new_level ENUM('SUPERVISOR','SI','MHO'),
    action VARCHAR(50),  -- APPROVE, DECLINE, REOPEN, REJECT
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_audit_complaint FOREIGN KEY (complaint_id) REFERENCES resident_complaints(complaint_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by) REFERENCES users(user_id)
);
```

**Usage:**

```javascript
// Log every status change
await db.query(`
    INSERT INTO complaint_audit_log 
    (complaint_id, changed_by, old_status, new_status, action)
    VALUES (?, ?, ?, ?, ?)
`, [complaintId, userId, 'PENDING', 'IN_PROGRESS', 'APPROVE']);
```

---

## Related Documentation

- [Overview](../overview.md) - Complaint management domain overview
- [Architecture](../architecture.md) - Complaint escalation state machine
- [Enums](../enums.md) - complaint_status, current_level specifications
- [Domain: Routing & Assignment](./routing-assignment.md) - Geographic routing logic
- [Table: resident_complaints](../tables/resident_complaints.md) - Complaint table details
- [Table: immediate_tasks](../tables/immediate_tasks.md) - Task table details
