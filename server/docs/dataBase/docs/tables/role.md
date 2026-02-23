# Table: `role`

**Domain:** [User Authentication & Authorization](../domains/user-auth.md)  
**Purpose:** Define system roles for role-based access control (RBAC)

---

## Table Structure

```sql
CREATE TABLE role (
    role_id BIGINT PRIMARY KEY,
    role_name ENUM('RESIDENT','TRASHMAN','SUPERVISOR','SI','MHO','COMMISSIONER','ADMIN')
);
```

---

## Columns

| Column | Type | Null | Key | Default | Description |
|--------|------|------|-----|---------|-------------|
| `role_id` | BIGINT | NO | PK | - | Unique identifier for role |
| `role_name` | ENUM | NO | - | - | Role name (7 possible values) |

---

## Primary Key

**Column:** `role_id`  
**Type:** BIGINT  
**Auto-Increment:** No (manually seeded)

**Design Note:** Static lookup table with predefined role_id values (1-7).

---

## Foreign Key Relationships

### Referenced By (1:N)

| Child Table | Child Column | Relationship | Description |
|-------------|--------------|--------------|-------------|
| `users` | `role_id` | 1:N | Each user has exactly one role |
| `division_officers` | `role_id` | 1:N | Division-role mapping |

---

## Enum Values

| role_name | Typical role_id | Access Level | Description |
|-----------|-----------------|--------------|-------------|
| `RESIDENT` | 1 | Lowest | Regular citizens |
| `TRASHMAN` | 2 | Worker | Waste collection field workers |
| `SUPERVISOR` | 3 | First-line management | Field supervisors |
| `SI` | 4 | Mid-level authority | Sanitary Inspectors |
| `MHO` | 5 | Senior authority | Municipal Health Officers |
| `COMMISSIONER` | 6 | Executive | Municipal commissioners |
| `ADMIN` | 7 | Superuser | System administrators |

**See:** [Enum Reference](../enums.md#role_name-table-role) for complete permission matrix.

---

## Business Rules

1. **Static Data:** This table is seeded once during schema creation and rarely modified
2. **No Deletions:** Roles cannot be deleted if referenced by `users` (FK constraint)
3. **Unique Names:** `role_name` must be unique (enum constraint enforces this)
4. **Sequential Hierarchy:** Role IDs represent authority levels (higher ID = higher permissions)

---

## Seed Data

```sql
INSERT INTO role (role_id, role_name) VALUES
(1, 'RESIDENT'),
(2, 'TRASHMAN'),
(3, 'SUPERVISOR'),
(4, 'SI'),
(5, 'MHO'),
(6, 'COMMISSIONER'),
(7, 'ADMIN');
```

---

## Common Queries

### Fetch All Roles

```sql
SELECT * FROM role ORDER BY role_id;
```

### Check User's Role

```sql
SELECT r.role_name 
FROM users u
JOIN role r ON u.role_id = r.role_id
WHERE u.user_id = ?;
```

### Count Users Per Role

```sql
SELECT r.role_name, COUNT(u.user_id) AS user_count
FROM role r
LEFT JOIN users u ON r.role_id = u.role_id
GROUP BY r.role_id;
```

---

## Indexing

**Primary Key Index:** Automatically created on `role_id`  
**Additional Indexes:** None required (static lookup table with 7 rows)

---

## Performance Notes

- **Query Optimization:** Table fits entirely in memory (7 rows ≈ 100 bytes)
- **Caching Recommendation:** Cache in application memory (Redis/in-process cache)
- **Join Performance:** Fast PK-FK joins with `users` table

---

## Audit & Compliance

**Change Tracking:** Not required (static reference data)  
**GDPR Compliance:** N/A (contains no personal data)  
**Data Retention:** Permanent (no archival needed)

---

## Related Documentation

- [Domain: User Auth](../domains/user-auth.md) - Role hierarchy details
- [Enum: role_name](../enums.md#role_name-table-role) - Permission matrix
- [Table: users](./users.md) - User-role relationship
- [Architecture](../architecture.md) - RBAC design principles
