# Table: `division_officers`

**Purpose:** Map supervisors to ward divisions for administrative oversight

---

## Table Structure

```sql
CREATE TABLE division_officers (
    division_officer_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    role_id BIGINT,
    division_id BIGINT,
    
    CONSTRAINT fk_do_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_do_role FOREIGN KEY (role_id) REFERENCES role(role_id),
    CONSTRAINT fk_do_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `division_officer_id` | BIGINT | PRIMARY KEY | Unique officer assignment ID |
| `user_id` | BIGINT | FOREIGN KEY → users(user_id) | Officer (supervisor/SI) user ID |
| `role_id` | BIGINT | FOREIGN KEY → role(role_id) | Officer role (SUPERVISOR, SI, MHO) |
| `division_id` | BIGINT | FOREIGN KEY → ward_divisions(division_id) | Ward division being managed |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `user_id` | [users](users.md).user_id | Officer managing this division |
| `role_id` | [role](role.md).role_id | Officer's role (validation) |
| `division_id` | [geographic-hierarchy](geographic-hierarchy.md#table-ward_divisions).division_id | Division being managed |

---

## Business Rules

1. **Role Restriction:** `role_id` must be SUPERVISOR (3), SI (4), or MHO (5)
2. **Role Consistency:** `role_id` must match `users.role_id` for the given `user_id` (validation at application layer)
3. **Division Authority:** Officers can only approve complaints/tasks within their assigned divisions
4. **Hierarchy Mapping:**
   - **SUPERVISOR:** Manages 1+ divisions (handles immediate tasks, approves complaints at level 1)
   - **SI:** Oversees 1+ divisions (escalated complaints at level 2)
   - **MHO:** Oversees entire ward or multiple divisions (escalated complaints at level 3)
5. **Multiple Assignments:** Officers may be assigned to multiple divisions

---

## Common Queries

### Assign Officer to Division

```sql
INSERT INTO division_officers (user_id, role_id, division_id)
VALUES (?, ?, ?);
```

### Find Divisions Managed by Officer

```sql
SELECT wd.*
FROM ward_divisions wd
JOIN division_officers do ON wd.division_id = do.division_id
WHERE do.user_id = ?;
```

### Find Officers in Division

```sql
SELECT u.*, r.role_name
FROM division_officers do
JOIN users u ON do.user_id = u.user_id
JOIN role r ON do.role_id = r.role_id
WHERE do.division_id = ?;
```

### Get Officer Authority (verify complaint approval)

```sql
SELECT COUNT(*) AS can_approve
FROM division_officers do
JOIN resident_complaints rc ON do.division_id = rc.division_id
WHERE do.user_id = ? AND rc.complaint_id = ?;
```

### List All Supervisors with Divisions

```sql
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    wd.division_name,
    w.ward_name
FROM division_officers do
JOIN users u ON do.user_id = u.user_id
JOIN ward_divisions wd ON do.division_id = wd.division_id
JOIN ward w ON wd.ward_id = w.ward_id
WHERE do.role_id = 3 -- SUPERVISOR
ORDER BY u.last_name;
```

---

## Recommended Indexes

```sql
-- Find divisions for officer (complaint approval workflow)
CREATE INDEX idx_do_user ON division_officers(user_id);

-- Find officers in division (admin dashboard)
CREATE INDEX idx_do_division ON division_officers(division_id);

-- Validate role-division mapping (security check)
CREATE INDEX idx_do_role_division ON division_officers(role_id, division_id);
```

---

## Performance Considerations

- **Caching:** Division-officer mappings change infrequently, cache in Redis with key pattern `division:<id>:officers`
- **Authorization:** Pre-fetch officer divisions on login, store in JWT/session for fast permission checks
- **Denormalization:** Consider adding `division_id` to complaints table for faster filtering without JOIN

---

## Related Documentation

- [Domain: Routing & Assignment](../domains/routing-assignment.md) - Division management workflows
- [Domain: Complaints](../domains/complaints.md) - Officer approval authority
- [Table: users](users.md) - Parent users table
- [Table: ward_divisions](geographic-hierarchy.md#table-ward_divisions) - Division details
- [Table: role](role.md) - Officer role types
