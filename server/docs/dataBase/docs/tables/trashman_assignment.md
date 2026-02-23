# Table: `trashman_assignment`

**Purpose:** Assign trash collectors (workers) to specific collection routes

---

## Table Structure

```sql
CREATE TABLE trashman_assignment (
    assignment_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    route_id BIGINT,
    is_active TINYINT(1),
    
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_assignment_route FOREIGN KEY (route_id) REFERENCES route(route_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `assignment_id` | BIGINT | PRIMARY KEY | Unique assignment record ID |
| `user_id` | BIGINT | FOREIGN KEY → users(user_id) | Trash collector (worker) ID |
| `route_id` | BIGINT | FOREIGN KEY → route(route_id) | Collection route ID |
| `is_active` | TINYINT(1) | NOT NULL | 0 = inactive, 1 = active assignment |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `user_id` | [users](users.md).user_id | Must be a TRASH_MAN role |
| `route_id` | [geographic-hierarchy](geographic-hierarchy.md#table-route).route_id | Collection route |

---

## Business Rules

1. **Role Restriction:** `user_id` should reference users with `role_name = 'TRASH_MAN'` (enforced at application layer)
2. **Active Assignment:** Workers can have multiple routes, but typically only one `is_active = 1` at a time
3. **Route Ownership:** Each route should have at least one active worker assigned
4. **Reassignment:** Setting `is_active = 0` allows removing workers from routes without deleting history
5. **Scheduling:** Assignments must align with route `start_time` and `end_time` (workers can't have overlapping active routes)

---

## Common Queries

### Assign Worker to Route

```sql
INSERT INTO trashman_assignment (user_id, route_id, is_active)
VALUES (?, ?, 1);
```

### Find Active Routes for Worker

```sql
SELECT r.* 
FROM route r
JOIN trashman_assignment ta ON r.route_id = ta.route_id
WHERE ta.user_id = ? AND ta.is_active = 1;
```

### Find Workers Assigned to Route

```sql
SELECT u.*
FROM users u
JOIN trashman_assignment ta ON u.user_id = ta.user_id
WHERE ta.route_id = ? AND ta.is_active = 1;
```

### Deactivate Assignment

```sql
UPDATE trashman_assignment
SET is_active = 0
WHERE assignment_id = ?;
```

### Get Worker with Route Details

```sql
SELECT 
    u.first_name,
    u.last_name,
    r.route_name,
    r.start_time,
    r.end_time,
    ta.is_active
FROM trashman_assignment ta
JOIN users u ON ta.user_id = u.user_id
JOIN route r ON ta.route_id = r.route_id
WHERE ta.user_id = ?;
```

---

## Recommended Indexes

```sql
-- Find active assignments for worker (attendance verification)
CREATE INDEX idx_assignment_user_active ON trashman_assignment(user_id, is_active);

-- Find workers for route (task creation)
CREATE INDEX idx_assignment_route_active ON trashman_assignment(route_id, is_active);
```

---

## Performance Considerations

- **Caching:** Since assignments change infrequently, cache active worker-route mappings in Redis
- **Archiving:** Keep historical assignments for payroll/audit, but filter queries with `is_active = 1`
- **Route Validation:** Before creating immediate_tasks, verify route has active workers assigned

---

## Related Documentation

- [Domain: Routing & Assignment](../domains/routing-assignment.md) - Complete assignment workflows
- [Table: route](geographic-hierarchy.md#table-route) - Parent route table
- [Table: users](users.md) - Parent users table
- [Table: immediate_tasks](immediate_tasks.md) - Tasks created for assigned routes
