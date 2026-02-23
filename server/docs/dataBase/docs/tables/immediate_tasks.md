# Table: `immediate_tasks`

**Purpose:** Track actionable tasks created from approved complaints

---

## Table Structure

```sql
CREATE TABLE immediate_tasks (
    task_id BIGINT PRIMARY KEY,
    complaint_id BIGINT,
    assigned_to BIGINT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_complaint FOREIGN KEY (complaint_id) REFERENCES resident_complaints(complaint_id),
    CONSTRAINT fk_task_user FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `task_id` | BIGINT | PRIMARY KEY | Unique task identifier |
| `complaint_id` | BIGINT | FOREIGN KEY → resident_complaints(complaint_id) | Parent complaint that generated this task |
| `assigned_to` | BIGINT | FOREIGN KEY → users(user_id) | Worker assigned to complete task |
| `status` | ENUM | DEFAULT 'PENDING' | Task completion status (see [enums](../enums.md#status)) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Task creation time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `complaint_id` | [resident_complaints](resident_complaints.md).complaint_id | Complaint that triggered this task |
| `assigned_to` | [users](users.md).user_id | Worker assigned (TRASH_MAN role) |

---

## Task Lifecycle

### Status Flow

```
PENDING → IN_PROGRESS → COMPLETED
```

**Workflow:**
1. **PENDING:** Task created when complaint approved by officer
2. **IN_PROGRESS:** Worker accepts task and starts work
3. **COMPLETED:** Worker marks task as done (with completion photo/notes)

### Creation Logic

```sql
-- When officer approves complaint:
INSERT INTO immediate_tasks (complaint_id, assigned_to, status)
VALUES (?, ?, 'PENDING');

-- Update complaint status:
UPDATE resident_complaints
SET complaint_status = 'IN_PROGRESS'
WHERE complaint_id = ?;
```

---

## Common Queries

### Create Task from Complaint

```sql
INSERT INTO immediate_tasks (complaint_id, assigned_to)
VALUES (?, ?);
```

### Worker's Task List

```sql
SELECT 
    t.*,
    rc.complaint_title,
    rc.complaint_description,
    rc.complaint_img,
    u.first_name AS resident_name
FROM immediate_tasks t
JOIN resident_complaints rc ON t.complaint_id = rc.complaint_id
JOIN users u ON rc.user_id = u.user_id
WHERE t.assigned_to = ? 
  AND t.status != 'COMPLETED'
ORDER BY t.created_at ASC;
```

### Start Task

```sql
UPDATE immediate_tasks
SET status = 'IN_PROGRESS'
WHERE task_id = ? AND assigned_to = ?;
```

### Complete Task

```sql
-- Mark task complete
UPDATE immediate_tasks
SET status = 'COMPLETED'
WHERE task_id = ?;

-- Update parent complaint
UPDATE resident_complaints
SET complaint_status = 'RESOLVED'
WHERE complaint_id = (
    SELECT complaint_id FROM immediate_tasks WHERE task_id = ?
);
```

### Division Officer Task Overview

```sql
SELECT 
    t.*,
    rc.complaint_title,
    u.first_name AS worker_name
FROM immediate_tasks t
JOIN resident_complaints rc ON t.complaint_id = rc.complaint_id
JOIN users u ON t.assigned_to = u.user_id
WHERE rc.division_id = ?
ORDER BY t.created_at DESC;
```

### Stats: Tasks by Status

```sql
SELECT 
    status,
    COUNT(*) AS task_count
FROM immediate_tasks
GROUP BY status;
```

---

## Recommended Indexes

```sql
-- Worker task queue (filtered by assignee + status)
CREATE INDEX idx_task_assignee_status 
ON immediate_tasks(assigned_to, status);

-- Complaint task lookup
CREATE INDEX idx_task_complaint 
ON immediate_tasks(complaint_id);

-- Date-based filtering
CREATE INDEX idx_task_created 
ON immediate_tasks(created_at DESC);
```

---

## Business Rules

1. **Role Restriction:** `assigned_to` must reference TRASH_MAN role (validated at API layer)
2. **One Task per Complaint:** Each complaint should generate at most one immediate task (enforced at business logic, not DB constraint)
3. **Assignment Validation:** Worker must be assigned to route related to complaint (via `trashman_assignment` table)
4. **Status Synchronization:** Task completion updates parent complaint status to 'RESOLVED'
5. **Timezone:** `created_at` in UTC (display in local time in UI)

---

## Performance Considerations

- **Worker Dashboard:** Index on `(assigned_to, status)` optimizes task queue queries
- **Notification Triggers:** Consider event-driven notifications when task status changes (e.g., push notification to worker on new PENDING task)
- **Archiving:** Partition by `created_at` for old completed tasks (e.g., >6 months)
- **Denormalization:** May cache `complaint_title` in tasks table for faster worker queue rendering

---

## Related Documentation

- [Domain: Complaints](../domains/complaints.md) - Task creation from complaint approval
- [Table: resident_complaints](resident_complaints.md) - Parent complaint details
- [Table: trashman_assignment](trashman_assignment.md) - Worker-route assignments for validation
- [Enums: status](../enums.md#status) - Task status values
