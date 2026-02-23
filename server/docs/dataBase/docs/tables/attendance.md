# Table: `attendance`

**Domain:** [Attendance Verification](../domains/attendance.md)  
**Purpose:** Track worker attendance with dual verification modes (GEO_SELFIE or MANUAL)

---

## Table Structure

```sql
CREATE TABLE attendance (
    att_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_role BIGINT,
    att_type ENUM('GEO_SELFIE','MANUAL'),
    is_verified TINYINT(1),
    verified_by BIGINT,
    created_at DATETIME,
    
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_attendance_verifier FOREIGN KEY (verified_by) REFERENCES users(user_id)
);
```

---

## Columns

| Column | Type | Null | Key | Default | Description |
|--------|------|------|-----|---------|-------------|
| `att_id` | BIGINT | NO | PK | AUTO_INCREMENT | Unique attendance record ID |
| `user_id` | BIGINT | YES | FK | NULL | Worker who marked attendance |
| `user_role` | BIGINT | YES | - | NULL | Role ID at time of attendance (audit field, no FK) |
| `att_type` | ENUM | YES | - | NULL | `GEO_SELFIE` (photo+GPS) or `MANUAL` (supervisor entry) |
| `is_verified` | TINYINT(1) | YES | - | NULL | 0=pending supervisor approval, 1=verified |
| `verified_by` | BIGINT | YES | FK | NULL | Supervisor who verified (NULL if pending) |
| `created_at` | DATETIME | YES | - | UTC_TIMESTAMP() | Attendance timestamp (UTC) |

---

## Foreign Key Relationships

| Foreign Key | References | Description |
|-------------|------------|-------------|
| `user_id` | `users(user_id)` | Worker marking attendance |
| `verified_by` | `users(user_id)` | Supervisor who verified attendance |

---

## Attendance Type Logic

### GEO_SELFIE
- Worker uploads selfie with GPS coordinates via mobile app
- Creates record in `attendance` (is_verified=0) AND `geo_attendance` (with image URL)
- Requires supervisor approval (UPDATE is_verified=1, verified_by=supervisor_id)

### MANUAL
- Supervisor manually marks worker present
- Creates record in `attendance` only (is_verified=1 immediately)
- No `geo_attendance` record (no photo needed)

---

## Common Queries

### Submit GEO_SELFIE Attendance

```sql
INSERT INTO attendance (user_id, user_role, att_type, is_verified, created_at)
VALUES (?, ?, 'GEO_SELFIE', 0, UTC_TIMESTAMP());
-- Returns att_id for linking to geo_attendance
```

### Submit MANUAL Attendance

```sql
INSERT INTO attendance (user_id, user_role, att_type, is_verified, verified_by, created_at)
VALUES (?, ?, 'MANUAL', 1, ?, UTC_TIMESTAMP());
```

### Fetch Pending Verifications

```sql
SELECT a.*, u.first_name, u.last_name
FROM attendance a
JOIN users u ON a.user_id = u.user_id
WHERE a.is_verified = 0 AND a.att_type = 'GEO_SELFIE'
ORDER BY a.created_at ASC;
```

### Approve Attendance

```sql
UPDATE attendance
SET is_verified = 1, verified_by = ?
WHERE att_id = ?;
```

### Worker Attendance History

```sql
SELECT * FROM attendance
WHERE user_id = ? 
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY created_at DESC;
```

---

## Indexes

```sql
CREATE INDEX idx_attendance_verification ON attendance(verified_by, att_type, created_at);
CREATE INDEX idx_attendance_user_created ON attendance(user_id, created_at DESC);
CREATE INDEX idx_attendance_date ON attendance(created_at);
```

---

## Business Rules

1. **One Attendance Per Day:** Worker can mark attendance only once per day (enforced in application)
2. **GEO_SELFIE Requirements:** Must have corresponding `geo_attendance` record with image URL
3. **MANUAL Authorization:** Only SUPERVISOR+ roles can create MANUAL attendance
4. **Verification Authority:** Only SUPERVISOR+ can verify GEO_SELFIE attendance
5. **Immutable Type:** `att_type` cannot be changed after creation

---

## Related Documentation

- [Domain: Attendance](../domains/attendance.md) - Complete workflows
- [Table: geo_attendance](./geo_attendance.md) - Geo-tagged photo storage
- [Enums](../enums.md#att_type-table-attendance) - Attendance type specification
- [Performance](../performance.md) - Attendance optimization strategies
