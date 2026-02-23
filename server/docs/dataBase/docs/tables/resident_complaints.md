# Table: `resident_complaints`

**Purpose:** Track waste collection complaints from residents with escalation workflow

---

## Table Structure

```sql
CREATE TABLE resident_complaints (
    complaint_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    division_id BIGINT,
    route_id BIGINT,
    complaint_img TEXT,
    complaint_title VARCHAR(255),
    complaint_description TEXT,
    complaint_status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'),
    current_level ENUM('SUPERVISOR', 'SI', 'MHO'),
    supervisor_accept_count INT,
    supervisor_decline_count INT,
    si_accept_count INT,
    si_decline_count INT,
    mho_accept_count INT,
    mho_decline_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_complaint_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_complaint_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id),
    CONSTRAINT fk_complaint_route FOREIGN KEY (route_id) REFERENCES route(route_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `complaint_id` | BIGINT | PRIMARY KEY | Unique complaint identifier |
| `user_id` | BIGINT | FOREIGN KEY → users(user_id) | Resident who filed complaint |
| `division_id` | BIGINT | FOREIGN KEY → ward_divisions(division_id) | Geographic division of complaint |
| `route_id` | BIGINT | FOREIGN KEY → route(route_id) | Collection route related to complaint |
| `complaint_img` | TEXT | - | Cloudinary URL to uploaded image |
| `complaint_title` | VARCHAR(255) | NOT NULL | Short complaint summary |
| `complaint_description` | TEXT | NOT NULL | Detailed complaint description |
| `complaint_status` | ENUM | DEFAULT 'PENDING' | Current workflow state (see [enums](../enums.md#complaint_status)) |
| `current_level` | ENUM | DEFAULT 'SUPERVISOR' | Current escalation level (see [enums](../enums.md#current_level)) |
| `supervisor_accept_count` | INT | DEFAULT 0 | Number of supervisor approvals |
| `supervisor_decline_count` | INT | DEFAULT 0 | Number of supervisor rejections |
| `si_accept_count` | INT | DEFAULT 0 | Number of SI approvals |
| `si_decline_count` | INT | DEFAULT 0 | Number of SI rejections |
| `mho_accept_count` | INT | DEFAULT 0 | Number of MHO approvals |
| `mho_decline_count` | INT | DEFAULT 0 | Number of MHO rejections |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Complaint submission time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `user_id` | [users](users.md).user_id | Complaint filer (RESIDENT role) |
| `division_id` | [geographic-hierarchy](geographic-hierarchy.md#table-ward_divisions).division_id | Division where issue occurred |
| `route_id` | [geographic-hierarchy](geographic-hierarchy.md#table-route).route_id | Collection route with issue |

### Child Tables

| Table | FK Column | Description |
|-------|-----------|-------------|
| [immediate_tasks](immediate_tasks.md) | complaint_id | Tasks created from approved complaints |

---

## Escalation Workflow

### State Machine

```
PENDING → IN_PROGRESS → RESOLVED
                      ↘ REJECTED
```

### Escalation Levels

```
SUPERVISOR (Level 1)
    ↓ (decline → escalate)
   SI (Level 2)
    ↓ (decline → escalate)
  MHO (Level 3 - final)
```

**Approval Logic:**
- **Accept:** Complaint approved, create `immediate_tasks` record with status 'PENDING'
- **Decline:** Increment decline counter, escalate to next level if needed
- **Escalation Trigger:** Configurable (e.g., 2 declines → escalate)

See [Domain: Complaints](../domains/complaints.md) for complete workflows.

---

## Common Queries

### Submit Complaint

```sql
INSERT INTO resident_complaints 
    (user_id, division_id, route_id, complaint_img, complaint_title, complaint_description)
VALUES (?, ?, ?, ?, ?, ?);
```

### Fetch Complaints for Division Officer

```sql
SELECT rc.*
FROM resident_complaints rc
JOIN division_officers do ON rc.division_id = do.division_id
WHERE do.user_id = ? 
  AND rc.complaint_status = 'PENDING'
  AND rc.current_level = (
      SELECT role_name FROM role WHERE role_id = do.role_id
  );
```

### Approve Complaint (create task)

```sql
-- Update complaint status
UPDATE resident_complaints
SET complaint_status = 'IN_PROGRESS',
    supervisor_accept_count = supervisor_accept_count + 1
WHERE complaint_id = ?;

-- Create task (in immediate_tasks table)
INSERT INTO immediate_tasks (complaint_id, assigned_to, status)
VALUES (?, ?, 'PENDING');
```

### Decline Complaint (escalate)

```sql
UPDATE resident_complaints
SET supervisor_decline_count = supervisor_decline_count + 1,
    current_level = 'SI'
WHERE complaint_id = ?;
```

### Resident's Complaint History

```sql
SELECT * FROM resident_complaints
WHERE user_id = ?
ORDER BY created_at DESC;
```

### Dashboard Stats

```sql
SELECT 
    complaint_status,
    current_level,
    COUNT(*) AS count
FROM resident_complaints
GROUP BY complaint_status, current_level;
```

---

## Recommended Indexes

```sql
-- Officer dashboard (filter by division + status + level)
CREATE INDEX idx_complaint_division_status_level 
ON resident_complaints(division_id, complaint_status, current_level);

-- Resident history
CREATE INDEX idx_complaint_user_created 
ON resident_complaints(user_id, created_at DESC);

-- Route-based filtering
CREATE INDEX idx_complaint_route 
ON resident_complaints(route_id);

-- Status monitoring
CREATE INDEX idx_complaint_status 
ON resident_complaints(complaint_status);
```

---

## Business Rules

1. **Role Restriction:** Only RESIDENT role can create complaints (enforced at API layer)
2. **Division Authority:** Officers can only approve/decline complaints in their assigned divisions (via `division_officers` table)
3. **Escalation Path:** SUPERVISOR → SI → MHO (cannot skip levels)
4. **Final Decision:** MHO approval/rejection is final (no further escalation)
5. **Task Creation:** `immediate_tasks` record created only on first acceptance (prevents duplicate tasks on re-approval)
6. **Image Upload:** `complaint_img` stored as Cloudinary URL (optimized delivery)
7. **Timezone:** `created_at` stored in UTC, convert to local time in frontend

---

## Performance Considerations

- **Dashboard Queries:** Use composite index on `(division_id, complaint_status, current_level)` for officer workload views
- **Caching:** Cache pending complaints count per division in Redis
- **Archiving:** Consider partitioning by `created_at` for old complaints (e.g., >1 year)
- **N+1 Prevention:** Eager-load user/division/route when fetching complaints lists

---

## Related Documentation

- [Domain: Complaints](../domains/complaints.md) - Complete escalation workflow with diagrams
- [Table: immediate_tasks](immediate_tasks.md) - Tasks created from approved complaints
- [Table: division_officers](division_officers.md) - Officer authority mapping
- [Enums: complaint_status](../enums.md#complaint_status) - Status values and transitions
- [Enums: current_level](../enums.md#current_level) - Escalation levels
